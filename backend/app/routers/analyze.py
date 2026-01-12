from fastapi import APIRouter, HTTPException, Body, Header
from app.services.supabase_client import get_supabase_client, supabase
from app.services.groq_client import GroqClient
from pydantic import BaseModel
import logging

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analyze"])
groq_client = GroqClient()

class AnalyzeRequest(BaseModel):
    resume_id: str
    jd_text: str

@router.post("/analyze")
async def analyze_resume(request: AnalyzeRequest, authorization: str = Header(None)):
    # 1. Get Authenticated Client
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
        
    try:
        token = authorization.split(" ")[1]
        # Validate token using global client first, just like upload.py
        user = supabase.auth.get_user(token)
        if not user or not user.user:
             raise Exception("Global auth check failed")
             
        user_client = get_supabase_client(token)
        logger.info(f"Authenticated user {user.user.id}")
    except Exception as e:
        logger.error(f"Auth failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid Token: {e}")

    # 2. Fetch Resume Text
    try:
        logger.info(f"Fetching resume {request.resume_id}")
        # Use user_client to respect RLS (Users can view own resumes)
        response = user_client.table("resumes").select("parsed_text").eq("id", request.resume_id).execute()
        if not response.data:
            logger.error("Resume not found or RLS blocked access")
            raise HTTPException(status_code=404, detail="Resume not found or access denied. Check RLS.")
        
        resume_text = response.data[0]['parsed_text']
        logger.info(f"Resume text length: {len(resume_text)}")
    except Exception as e:
        logger.error(f"Database fetch failed: {e}")
        raise HTTPException(status_code=500, detail=f"Database error details: {str(e)}")

    # 3. Call Groq API
    try:
        logger.info("Calling Groq API...")
        analysis_result = groq_client.analyze_resume(resume_text, request.jd_text)
        logger.info("Groq Analysis complete")
    except Exception as e:
        logger.error(f"AI Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")

    # 4. Save Analysis
    try:
        logger.info("Saving analysis to DB...")
        save_response = user_client.table("analyses").insert({
            "resume_id": request.resume_id,
            "jd_text": request.jd_text,
            "match_score": analysis_result.get("match_score"),
            "swot_data": analysis_result.get("swot_analysis"),
            "recommendations": analysis_result.get("recommendations")
        }).execute()
        
        if save_response.data:
             logger.info("Analysis saved successfully")
             return {
                 "analysis_id": save_response.data[0]['id'],
                 **analysis_result
             }
    except Exception as e:
        logger.error(f"Error saving analysis: {e}")
        # Return result even if save fails, but log it
        return analysis_result

    return analysis_result

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
             
             # 5. History Limit (Keep only last 5)
             try:
                 # Fetch all analysis IDs ordered by created_at desc
                 history_response = user_client.table("analyses").select("id, created_at").order("created_at", desc=True).execute()
                 
                 if history_response.data and len(history_response.data) > 5:
                     logger.info(f"Cleaning up history. Total count: {len(history_response.data)}")
                     # Keep top 5, delete the rest
                     ids_to_keep = [item['id'] for item in history_response.data[:5]]
                     # Delete where id NOT in ids_to_keep. 
                     # Supabase JS/Python client doesn't have a simple "not in" for delete easily without multiple calls or filters.
                     # Actually .not_.in_("id", ids_to_keep) should work if supported, or we filter explicitly.
                     # "neq" checks generated SQL, but "in" filter is easier.
                     # Let's delete items where id is IN the list of items to remove.
                     ids_to_remove = [item['id'] for item in history_response.data[5:]]
                     
                     if ids_to_remove:
                         user_client.table("analyses").delete().in_("id", ids_to_remove).execute()
                         logger.info(f"Removed {len(ids_to_remove)} old analysis records")
                         
             except Exception as cleanup_err:
                 # Non-critical, just log it
                 logger.error(f"History cleanup failed: {cleanup_err}")

             return {
                 "analysis_id": save_response.data[0]['id'],
                 **analysis_result
             }
    except Exception as e:
        logger.error(f"Error saving analysis: {e}")
        # Return result even if save fails, but log it
        return analysis_result

    return analysis_result

@router.get("/analyses/{analysis_id}")
async def get_analysis(analysis_id: str, authorization: str = Header(None)):
    """
    Get a specific analysis result by ID.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")

    try:
        token = authorization.split(" ")[1]
        user_client = get_supabase_client(token)
        
        # Select specific fields or all
        response = user_client.table("analyses").select("*").eq("id", analysis_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Analysis not found")
            
        return response.data[0]
        
    except Exception as e:
        logger.error(f"Error fetching analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyses")
async def get_analyses(authorization: str = Header(None)):
    """
    Get recent analysis history for the user (Limit 5).
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")

    try:
        token = authorization.split(" ")[1]
        user_client = get_supabase_client(token)
        
        # Fetch last 5 analyses
        # We also need to get the job title/company if possible. 
        # Since we don't store them explicitly, we'll return the ID, score, date.
        response = user_client.table("analyses").select("id, created_at, match_score, jd_text").order("created_at", desc=True).limit(5).execute()
        
        return response.data
        
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

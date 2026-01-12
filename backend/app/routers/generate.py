import json
from fastapi import APIRouter, HTTPException, Body, Header, Request
from fastapi.responses import Response
from app.services.supabase_client import get_supabase_client, supabase
from app.services.pdf_service import PDFService
from pydantic import BaseModel
from typing import List, Optional
import logging

router = APIRouter(prefix="/api", tags=["generate"])
logger = logging.getLogger(__name__)

# Models retained for documentation but not strict enforcement
class Suggestion(BaseModel):
    original: str
    suggested: str
    reason: Optional[str] = None
    status: Optional[str] = None

class GenerateRequest(BaseModel):
    analysis_id: str
    accepted_suggestions: List[Suggestion]

print("LOADING GENERATE MODULE V2")

@router.post("/generate-pdf")
async def generate_pdf(req: Request, authorization: str = Header(None)):
    # 0. Manual Payload Parsing
    try:
        data = await req.json()
        analysis_id = data.get("analysis_id")
        suggestions = data.get("accepted_suggestions", [])
        logger.info(f"Generate Request for {analysis_id}. Suggestions count: {len(suggestions)}")
        
        if not analysis_id:
             raise HTTPException(status_code=422, detail="Missing analysis_id")
    except Exception as e:
        logger.error(f"Payload parse error: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # 1. Auth Check
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        token = authorization.split(" ")[1]
        user = supabase.auth.get_user(token)
        if not user or not user.user:
             raise HTTPException(status_code=401, detail="Invalid Token")
             
        user_client = get_supabase_client(token)
    except Exception as e:
        logger.error(f"Auth failed in generation: {e}")
        raise HTTPException(status_code=401, detail="Authentication Failed")

    # 2. Fetch Analysis to get Resume ID
    try:
        analysis_res = user_client.table("analyses").select("resume_id").eq("id", analysis_id).execute()
        if not analysis_res.data:
            raise HTTPException(status_code=404, detail="Analysis not found")
            
        resume_id = analysis_res.data[0]['resume_id']
        
        # 3. Fetch Resume Text
        resume_res = user_client.table("resumes").select("parsed_text").eq("id", resume_id).execute()
        if not resume_res.data:
            raise HTTPException(status_code=404, detail="Resume not found")
            
        original_text = resume_res.data[0]['parsed_text']
        
    except Exception as e:
        logger.error(f"DB Fetch failed: {e}")
        raise HTTPException(status_code=500, detail="Database error during retrieval")
    
    # 4. Apply Patches
    final_text = original_text
    
    count = 0
    for s_dict in suggestions:
        # data might be dict or Pydantic model dict
        orig = s_dict.get("original", "")
        sugg = s_dict.get("suggested", "")
        
        if orig and orig in final_text:
            final_text = final_text.replace(orig, sugg)
            count += 1
        elif orig and orig.strip() in final_text:
             final_text = final_text.replace(orig.strip(), sugg)
             count += 1
        else:
            # Try partial match/fuzzy? For now just log
            pass
    
    logger.info(f"Applied {count} suggestions")
    
    # 5. Generate PDF
    try:
        pdf_bytes = PDFService.generate_pdf(final_text)
        
        return Response(
            content=pdf_bytes, 
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=optimized_resume.pdf"}
        )
    except Exception as e:
        logger.error(f"PDF Generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"PDF Generation failed: {e}")

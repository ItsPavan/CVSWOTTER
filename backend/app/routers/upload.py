from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from app.services.supabase_client import get_supabase_client, supabase
from app.services.pdf_service import PDFService
import uuid
import os

router = APIRouter(prefix="/api", tags=["upload"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...), 
    authorization: str = Header(None)
):
    """
    Uploads a PDF resume, parses text, and saves to Supabase.
    """
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")

    content = await file.read()
    
    # 1. Extract Text
    text = PDFService.extract_text(content, file.filename)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from file")
    
    # 2. Get Authenticated Client
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
        
    try:
        token = authorization.split(" ")[1]
        # Create a client acting as the user
        user_client = get_supabase_client(token)
        
        # Verify user and get ID
        # IMPORTANT: Use the global supabase client to validate the token. 
        # The user_client (REST) does not have the session state for auth.get_user() without args.
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
             raise HTTPException(status_code=401, detail="Invalid User Token")
        
        user_id = user_response.user.id
        
    except Exception as e:
        print(f"Auth Error: {str(e)}") # Log for debugging
        raise HTTPException(status_code=401, detail=f"Authentication Failed: {str(e)}")

    # 3. Upload/Save
    file_path = f"resumes/{uuid.uuid4()}.pdf"
    
    try:
        # Perform Insert acting AS THE USER
        response = user_client.table("resumes").insert({
            "user_id": user_id,
            "file_name": file.filename,
            "storage_path": file_path,
            "parsed_text": text
        }).execute()
        
        if response.data:
            return {"resume_id": response.data[0]['id']}
        else:
             raise HTTPException(status_code=500, detail="Saved but failed to return ID. Check RLS policies.")
             
    except Exception as e:
        error_msg = str(e)
        print(f"Error saving resume: {error_msg}")
        
        # Self-healing: If profile is missing (FK error), try to create it
        if "foreign key constraint" in error_msg.lower() and "profiles" in error_msg.lower():
            try:
                print("Attempting to auto-create missing profile...")
                user_client.table("profiles").insert({"id": user_id}).execute()
                # Retry upload
                response = user_client.table("resumes").insert({
                    "user_id": user_id,
                    "file_name": file.filename,
                    "storage_path": file_path,
                    "parsed_text": text
                }).execute()
                if response.data:
                    return {"resume_id": response.data[0]['id']}
            except Exception as create_err:
                print(f"Failed to auto-create profile: {create_err}")
                raise HTTPException(status_code=500, detail="Database Error: User profile missing. Please run the 'fix_schema.sql' script in Supabase.")

        if "policy" in error_msg.lower():
             raise HTTPException(status_code=500, detail="Database RLS Error: Ensure you have run the updated SQL schema.")
    
@router.post("/extract-text")
async def extract_text_only(
    file: UploadFile = File(...)
):
    """
    Extracts text from a file (PDF/DOCX) and returns it.
    Does NOT save to database.
    """
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")

    content = await file.read()
    text = PDFService.extract_text(content, file.filename)
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text")
        
    return {"text": text, "filename": file.filename}

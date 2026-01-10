from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import upload, analyze, generate
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.exception_handlers import request_validation_exception_handler

import logging
import sys

# Configure Logging to File
logging.basicConfig(
    filename='backend_debug.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    force=True
)
logger = logging.getLogger(__name__)
# Also print to stdout
logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

app = FastAPI(title="ResumeAI Architect API")

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://toppile.evolviscend.com",
    "https://www.evolviscend.com",
    "https://cvswotter-p60xtdawt-pavan-hareshs-projects.vercel.app",
    "https://cvswotter.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "ResumeAI Architect API is running"}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.debug(f"Incoming request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.debug(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {e}", exc_info=True)
        raise e

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"DEBUG: Validation Error: {exc}")
    return await request_validation_exception_handler(request, exc)

app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(generate.router)

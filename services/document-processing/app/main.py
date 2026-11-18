"""
FastAPI Microservice for Document Processing & Text Intelligence
Exposes endpoints for PDF extraction, OCR execution, text diffing, and corrigendum classification.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.services.pdf_extractor import PdfExtractor
from app.services.diff_engine import DiffEngine
from app.services.classifier import CorrigendumClassifier

app = FastAPI(
    title="Tender Tracker Document Intelligence API",
    version="1.0.0",
    description="Microservice for PDF parsing, OCR fallback, document diffing, and corrigendum classification."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pdf_extractor = PdfExtractor()
diff_engine = DiffEngine()
classifier = CorrigendumClassifier()


class DiffRequest(BaseModel):
    baseText: str
    revisedText: str


class ClassifyRequest(BaseModel):
    text: str


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "document-processing",
        "version": "1.0.0"
    }


@app.post("/process/extract")
async def extract_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    try:
        extraction_result = pdf_extractor.extract_document(file_bytes)
        return {
            "filename": file.filename,
            "pageCount": extraction_result["pageCount"],
            "pages": extraction_result["pages"],
            "fullText": extraction_result["fullText"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")


@app.post("/process/diff")
def compute_text_diff(req: DiffRequest):
    result = diff_engine.compute_diff(req.baseText, req.revisedText)
    return result


@app.post("/process/classify")
def classify_amendment(req: ClassifyRequest):
    category, confidence = classifier.classify(req.text)
    return {
        "amendmentType": category,
        "confidence": confidence
    }


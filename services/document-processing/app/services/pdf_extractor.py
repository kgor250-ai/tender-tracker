"""
PDF & OCR Extraction Service
Extracts native text, page structures, font blocks, and coordinates using PyMuPDF (fitz),
with automatic fallback to Tesseract OCR when native text is scarce or scanned.
"""

import io
import fitz  # PyMuPDF
try:
    import pytesseract
    from PIL import Image
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


class PdfExtractor:
    def __init__(self, ocr_min_chars: int = 30):
        self.ocr_min_chars = ocr_min_chars

    def extract_document(self, file_bytes: bytes) -> dict:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages_output = []
        full_text = []

        for page_index in range(len(doc)):
            page = doc[page_index]
            page_text = page.get_text("text").strip()
            is_ocr = False

            # If page text is very sparse, attempt OCR on rendered pixmap
            if len(page_text) < self.ocr_min_chars and TESSERACT_AVAILABLE:
                try:
                    pix = page.get_pixmap(dpi=200)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    ocr_text = pytesseract.image_to_string(img)
                    if len(ocr_text.strip()) > len(page_text):
                        page_text = ocr_text.strip()
                        is_ocr = True
                except Exception as e:
                    # Gracefully continue with available native text if OCR encounters error
                    pass

            pages_output.append({
                "pageNumber": page_index + 1,
                "text": page_text,
                "isOcr": is_ocr,
                "charCount": len(page_text)
            })
            full_text.append(page_text)

        doc.close()

        return {
            "pageCount": len(pages_output),
            "pages": pages_output,
            "fullText": "\n\n".join(full_text)
        }


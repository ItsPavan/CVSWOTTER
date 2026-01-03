import fitz  # PyMuPDF
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
import io

class PDFService:
    @staticmethod
    def extract_text(file_bytes: bytes, filename: str = "") -> str:
        """Extracts text from PDF or DOCX bytes."""
        try:
            if filename.lower().endswith('.docx'):
                import docx
                doc = docx.Document(io.BytesIO(file_bytes))
                return "\n".join([para.text for para in doc.paragraphs])
            else:
                # Default to PDF
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                text = ""
                for page in doc:
                    text += page.get_text()
                return text
        except Exception as e:
            print(f"Error extracting text: {e}")
            return ""

    @staticmethod
    def generate_pdf(text_content: str) -> bytes:
        """Generates a simple PDF from text content."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        style = styles["Normal"]
        
        story = []
        # Handle newlines by splitting into paragraphs
        for paragraph in text_content.split('\n\n'):
            p = Paragraph(paragraph.replace('\n', '<br/>'), style)
            story.append(p)
            story.append(Spacer(1, 12))
            
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

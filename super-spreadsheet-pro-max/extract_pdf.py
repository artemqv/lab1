import PyPDF2
import sys

pdf_path = sys.argv[1] if len(sys.argv) > 1 else "Итоговое задание (1).pdf"

with open(pdf_path, 'rb') as file:
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n\n"
    print(text)

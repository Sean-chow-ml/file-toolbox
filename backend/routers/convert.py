import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response

from services.libreoffice import convert_with_libreoffice

router = APIRouter(prefix="/api/convert")

ALLOWED_WORD = {".doc", ".docx"}
ALLOWED_EXCEL = {".xls", ".xlsx"}
ALLOWED_PDF = {".pdf"}

MAX_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/word-to-pdf")
async def word_to_pdf(file: UploadFile = File(...)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_WORD:
        raise HTTPException(400, "仅支持 .doc / .docx 文件")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(413, "文件超过 50MB 限制")

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, f"input{ext}")
        with open(input_path, "wb") as f:
            f.write(content)

        try:
            output_path = await convert_with_libreoffice(input_path, "pdf", tmpdir)
        except Exception as e:
            raise HTTPException(500, str(e))

        stem = Path(file.filename or "output").stem
        output_bytes = Path(output_path).read_bytes()

    return Response(
        content=output_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{stem}.pdf"'},
    )


@router.post("/excel-to-pdf")
async def excel_to_pdf(file: UploadFile = File(...)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXCEL:
        raise HTTPException(400, "仅支持 .xls / .xlsx 文件")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(413, "文件超过 50MB 限制")

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, f"input{ext}")
        with open(input_path, "wb") as f:
            f.write(content)

        try:
            output_path = await convert_with_libreoffice(input_path, "pdf", tmpdir)
        except Exception as e:
            raise HTTPException(500, str(e))

        stem = Path(file.filename or "output").stem
        output_bytes = Path(output_path).read_bytes()

    return Response(
        content=output_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{stem}.pdf"'},
    )


@router.post("/pdf-to-word")
async def pdf_to_word(file: UploadFile = File(...)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_PDF:
        raise HTTPException(400, "仅支持 .pdf 文件")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(413, "文件超过 50MB 限制")

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, "input.pdf")
        with open(input_path, "wb") as f:
            f.write(content)

        stem = Path(file.filename or "output").stem
        output_path = os.path.join(tmpdir, f"{stem}.docx")

        try:
            from pdf2docx import Converter
            cv = Converter(input_path)
            cv.convert(output_path)
            cv.close()
        except Exception as e:
            raise HTTPException(500, f"PDF 转 Word 失败: {e}")

        output_bytes = Path(output_path).read_bytes()

    return Response(
        content=output_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{stem}.docx"'},
    )

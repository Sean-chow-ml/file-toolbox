import asyncio
import os
import sys
from pathlib import Path


def _find_soffice() -> str:
    """Find soffice/libreoffice executable on current OS."""
    if sys.platform == "win32":
        candidates = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        ]
        for c in candidates:
            if os.path.exists(c):
                return c
        raise RuntimeError(
            "未找到 LibreOffice，请从 https://www.libreoffice.org/download/ 下载安装，"
            "或将 soffice.exe 所在目录加入 PATH"
        )
    # Linux/macOS (Docker)
    for name in ("libreoffice", "soffice"):
        import shutil
        path = shutil.which(name)
        if path:
            return path
    raise RuntimeError("未找到 LibreOffice，请确保容器内已安装")


async def convert_with_libreoffice(
    input_path: str,
    output_format: str,
    output_dir: str,
) -> str:
    """Run LibreOffice headless conversion and return output file path."""
    soffice = _find_soffice()
    cmd = [
        soffice,
        "--headless",
        "--convert-to",
        output_format,
        "--outdir",
        output_dir,
        input_path,
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)

    if proc.returncode != 0:
        raise RuntimeError(f"LibreOffice 转换失败: {stderr.decode()}")

    input_stem = Path(input_path).stem
    output_path = os.path.join(output_dir, f"{input_stem}.{output_format}")

    if not os.path.exists(output_path):
        files = list(Path(output_dir).glob(f"{input_stem}.*"))
        if not files:
            raise RuntimeError(
                f"转换后未找到输出文件。stdout={stdout.decode()} stderr={stderr.decode()}"
            )
        output_path = str(files[0])

    return output_path

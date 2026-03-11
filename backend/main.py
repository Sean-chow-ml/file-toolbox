import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import convert

app = FastAPI(title="文件工具箱 API", version="1.0.0")

# ALLOWED_ORIGINS env var: comma-separated list of allowed origins
# e.g. "https://file-toolbox.vercel.app,https://yourdomain.com"
_env_origins = os.getenv("ALLOWED_ORIGINS", "")
origins = [o.strip() for o in _env_origins.split(",") if o.strip()]

# Always allow local dev origins
origins += ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convert.router)


@app.get("/health")
def health():
    return {"status": "ok"}

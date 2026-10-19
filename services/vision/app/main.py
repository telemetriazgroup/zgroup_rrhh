import os
from typing import cast

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse

from app.extractor import build_extractor
from app.images import InvalidImage, inspect_image
from app.schemas import DocumentType, Extraction

app = FastAPI(title="GaritaControl Vision", version="0.1.0")
extractor = build_extractor()
DOCUMENT_TYPES = {"fotocheck", "dni"}


@app.middleware("http")
async def require_service_key(request, call_next):
    if request.url.path in {"/health", "/v1/contrato", "/docs", "/openapi.json", "/redoc"}:
        return await call_next(request)

    expected = os.getenv("VISION_SHARED_SECRET", "")
    if expected and request.headers.get("x-vision-key") != expected:
        return JSONResponse({"detail": "No autorizado"}, status_code=401)
    return await call_next(request)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "motor": extractor.motor}


@app.get("/v1/contrato")
def contrato() -> dict[str, object]:
    return {
        "servicio": "GaritaControl Vision",
        "consumo": "Cualquier aplicación puede llamar este contenedor. No pasa por la API de GaritaControl.",
        "autenticacion": "Cabecera X-Vision-Key",
        "extraer": {
            "metodo": "POST",
            "ruta": "/v1/documentos/extraer",
            "campos": ["tipoDocumento", "imagen"],
            "tipoDocumento": ["fotocheck", "dni"],
            "respuesta": ["nombre", "apellido", "dni", "foto", "confianza", "estado", "motor", "advertencias"],
        },
        "entrenamiento": "python training/evaluar.py dentro de este contenedor, con fotos en training/dataset.",
    }


@app.post("/v1/documentos/extraer", response_model=Extraction)
async def extraer(
    tipoDocumento: str = Form(...),
    imagen: UploadFile = File(...),
) -> Extraction | JSONResponse:
    if tipoDocumento not in DOCUMENT_TYPES:
        return JSONResponse(
            {"detail": "tipoDocumento debe ser fotocheck o dni."},
            status_code=422,
        )

    data = await imagen.read()
    document_type = cast(DocumentType, tipoDocumento)
    try:
        inspect_image(data)
    except InvalidImage as error:
        return Extraction(
            tipoDocumento=document_type,
            motor=extractor.motor,
            estado="rechazado",
            advertencias=[str(error)],
        )

    return extractor.extract(data, document_type)

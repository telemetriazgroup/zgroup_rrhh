from typing import Literal

from pydantic import BaseModel, Field


DocumentType = Literal["fotocheck", "dni"]
ExtractionStatus = Literal["extraido", "ilegible", "rechazado", "motor_no_disponible"]


class Confidence(BaseModel):
    nombre: float = 0
    apellido: float = 0
    dni: float = 0
    foto: float = 0


class Extraction(BaseModel):
    tipoDocumento: DocumentType
    motor: str
    estado: ExtractionStatus
    nombre: str | None = None
    apellido: str | None = None
    dni: str | None = None
    foto: str | None = None
    confianza: Confidence = Field(default_factory=Confidence)
    advertencias: list[str] = Field(default_factory=list)

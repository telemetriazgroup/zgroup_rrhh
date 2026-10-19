import base64
import os
from io import BytesIO
from typing import Protocol

from PIL import Image

from app.schemas import Confidence, DocumentType, Extraction


class DocumentExtractor(Protocol):
    motor: str

    def extract(self, image: bytes, tipo_documento: DocumentType) -> Extraction:
        """Devuelve nombre, apellido, DNI y el JPEG de la foto en base64."""


class UnconfiguredExtractor:
    motor = "unconfigured"

    def extract(self, image: bytes, tipo_documento: DocumentType) -> Extraction:
        del image
        return Extraction(
            tipoDocumento=tipo_documento,
            motor=self.motor,
            estado="motor_no_disponible",
            advertencias=[
                "El motor de reconocimiento no está configurado. No se inventaron datos del documento."
            ],
        )


class FixtureExtractor:
    """Resultado fijo para integrar la garita. No lee la imagen."""

    motor = "fixture"

    def extract(self, image: bytes, tipo_documento: DocumentType) -> Extraction:
        del image
        return Extraction(
            tipoDocumento=tipo_documento,
            motor=self.motor,
            estado="extraido",
            nombre="Carlos",
            apellido="Mendoza",
            dni="47382910",
            foto=_placeholder_portrait(),
            confianza=Confidence(nombre=0.99, apellido=0.99, dni=0.99, foto=0.99),
            advertencias=[
                "Resultado de prueba del motor fixture. No es reconocimiento del documento enviado."
            ],
        )


def build_extractor() -> DocumentExtractor:
    engine = os.getenv("VISION_ENGINE", "unconfigured")
    if engine == "fixture":
        return FixtureExtractor()
    if engine == "model":
        from app.engines.model import ModelExtractor

        return ModelExtractor()
    return UnconfiguredExtractor()


def _placeholder_portrait() -> str:
    buffer = BytesIO()
    Image.new("RGB", (80, 100), (22, 28, 37)).save(buffer, format="JPEG", quality=85)
    return base64.b64encode(buffer.getvalue()).decode("ascii")

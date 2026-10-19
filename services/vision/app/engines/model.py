from app.schemas import DocumentType, Extraction


class ModelExtractor:
    """Punto de extensión del equipo de visión.

    `extract` debe leer `image` y devolver nombre, apellido, DNI y el recorte
    de la foto en JPEG base64. No debe consultar trabajadores ni marcaciones.
    """

    motor = "model"

    def extract(self, image: bytes, tipo_documento: DocumentType) -> Extraction:
        del image
        return Extraction(
            tipoDocumento=tipo_documento,
            motor=self.motor,
            estado="motor_no_disponible",
            advertencias=[
                "ModelExtractor.extract todavía no implementa el reconocimiento."
            ],
        )

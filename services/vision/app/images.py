from io import BytesIO

from PIL import Image, UnidentifiedImageError


class InvalidImage(Exception):
    pass


MAX_BYTES = 8 * 1024 * 1024
MIN_WIDTH = 320
MIN_HEIGHT = 240
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}


def inspect_image(data: bytes) -> None:
    if len(data) > MAX_BYTES:
        raise InvalidImage("La imagen supera 8 MB.")
    if len(data) < 32:
        raise InvalidImage("La imagen está vacía.")

    try:
        with Image.open(BytesIO(data)) as probe:
            probe.verify()
        with Image.open(BytesIO(data)) as image:
            image.load()
            image_format = image.format
            width, height = image.size
    except (UnidentifiedImageError, OSError, ValueError) as error:
        raise InvalidImage("El archivo no es una imagen JPEG, PNG o WebP válida.") from error

    if image_format not in ALLOWED_FORMATS:
        raise InvalidImage("Formato no admitido. Use JPEG, PNG o WebP.")
    if width < MIN_WIDTH or height < MIN_HEIGHT:
        raise InvalidImage("La imagen debe tener al menos 320×240 px.")

from django.core.files.uploadedfile import UploadedFile
from users.models import UserCode
from .dtypes import encoded_files
import random, base64

def __generate_random_code() -> int:
    "generate a random code"
    code: str = ''
    for _ in range(6):
        code += str(random.randint(0, 9))
        
    if code[0] == '0':
        return __generate_random_code()
    
    return int(code)

def generate_verify_code() -> int | None:
    attempts: int = 0
    
    while not False and attempts < 30:
        code: int = __generate_random_code()
        if not UserCode.objects.filter(code=code).exists():
            return code
        attempts += 1
    
    return None


def encode_uploaded_files(uploaded_files: list[UploadedFile]) -> encoded_files:
    """Encode uploaded files to base64 format for storage in the database.

    Args:
        uploaded_files (list[UploadedFile]): A list of uploaded files to encode.

    Returns:
        encoded_files: the new encoded files in a list of dictionaries,
        where each dictionary contains the file name, base64 encoded content, and content type.
    """
    
    files: encoded_files = []
    for f in uploaded_files:
        content = f.read()
        encoded = base64.b64encode(content).decode()
        files.append({
            "name": f.name,
            "base64": encoded,
            "content_type": f.content_type,
        })
    return files
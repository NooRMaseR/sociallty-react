from typing import TypedDict

class FileEncoded(TypedDict):
    name: str
    base64: str
    content_type: str | None

type encoded_files = list[FileEncoded]
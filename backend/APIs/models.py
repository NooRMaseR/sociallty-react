import mimetypes

def get_media_type(path: str) -> tuple[str | None, str | None]:
    file_type, _ = mimetypes.guess_type(path)
    if file_type:
        return (file_type.split("/")[0], file_type)
    
    return (None, None)
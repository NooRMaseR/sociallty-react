from datetime import datetime
from io import BytesIO
from PIL import Image
import cv2


def extract_first_frame(video_file: str) -> BytesIO | None:
    """extracts the first frame from the video and save it in the memory

    Args:
        video_file (str): the file path

    Returns:
        BytesIO: the first frame if success, else `None`
    """

    video: cv2.VideoCapture = cv2.VideoCapture(video_file)
    counter: int = 0
    while True:
        success, frame = video.read()
        
        if success or counter >= 50:
            break
        
        counter += 1
        
    video.release()
    
    if not frame:
        return None
    
    image: Image.Image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    image_io = BytesIO()
    image.save(image_io, "webP")
    image.seek(0)
    return image_io


def format_errors(serializer) -> dict[str, str]:
    "formats the serializer.errors to Error0: `error`, Error1: `error`"
    counter: int = 0
    errors: dict[str, str] = {}
    for k, v in serializer.errors.items():  # type: ignore
        errors[f"Error{counter}"] = f"{v[0]} for {k} Field"
        counter += 1

    return errors


def format_time(time: datetime) -> str:
    "formatting the time like this `2024-13-2 5:30 PM`"
    return str(time.strftime("%Y-%m-%d %I:%M %p"))
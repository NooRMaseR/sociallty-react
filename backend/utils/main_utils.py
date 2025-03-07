from moviepy.video.io.VideoFileClip import VideoFileClip
from users.models import UserCode
from io import BytesIO
from PIL import Image
import random


def extract_first_frame(video_file: str) -> BytesIO | None:
    """Extracts the first frame from the video and saves it in memory.

    Args:
        video_file (str): The file path to the video.

    Returns:
        BytesIO: The first frame as a BytesIO object if successful, else `None`.
    """
    # Open the video file
    video = VideoFileClip(video_file)
    frame = video.get_frame(0.1)
    
    # Convert the array to image (PIL)
    image: Image.Image = Image.fromarray(frame)
    
    # Save the image to a BytesIO object in WebP format
    image_io = BytesIO()
    image.save(image_io, "webP")
    
    # Reset the stream position to the beginning
    video.close()
    image_io.seek(0)
    return image_io

def __generate_random_code() -> int:
    "generate a random code"
    code: str = ''
    for _ in range(6):
        code += str(random.randint(0, 9))
    
    return int(code)

def generate_verify_code() -> int | None:
    attempts: int = 0
    
    while not False and attempts < 30:
        code: int = __generate_random_code()
        if not UserCode.objects.filter(code=code).exists():
            return code
        attempts += 1
    
    return None
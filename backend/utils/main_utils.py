from users.models import UserCode
from io import BytesIO
from PIL import Image
import random
import cv2


def extract_first_frame(video_file: str) -> BytesIO | None:
    """Extracts the first frame from the video and saves it in memory.

    Args:
        video_file (str): The file path to the video.

    Returns:
        BytesIO: The first frame as a BytesIO object if successful, else `None`.
    """
    # Open the video file
    video = cv2.VideoCapture(video_file)
    
    # Check if the video was opened successfully
    if not video.isOpened():
        print("Error: Could not open the video file.")
        return None
    
    # Read the first frame
    success, frame = video.read()
    
    # Release the video capture object
    video.release()
    
    # If no frame was read, return None
    if not success or frame is None:
        return None
    
    # Convert the frame from BGR (OpenCV) to RGB (PIL)
    image: Image.Image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    
    # Save the image to a BytesIO object in WebP format
    image_io = BytesIO()
    image.save(image_io, "webP")
    
    # Reset the stream position to the beginning
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
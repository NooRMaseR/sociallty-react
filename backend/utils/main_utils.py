from users.models import UserCode
import random

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
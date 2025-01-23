# from difflib import get_close_matches
# from gtts import gTTS
# import googletrans
# import base64
# import json
# import sys
# import io

# class MaseR_Response:
#     "basic ai for technical support"

#     def __init__(self, msg: str) -> None:
#         self.response: tuple[str, str] = ("", "")
#         self.lang: str = "en"
#         self.acc: str = "us"
#         self.msg: str = msg
#         self.errorconnect: bool = False
        
#         try:
#             self.code = googletrans.Translator().detect(msg).lang  # type: ignore
#             self.errorconnect = False
#         except Exception as e:
#             self.code = "en"
#             self.msg = "no"
#             print(e, file=sys.stderr)
#             self.errorconnect = True

#         self.question: str = self.translate_to_ai(self.msg)

#         if not self.errorconnect:
#             # load the json file
#             with open("APIs/support.json", "r") as f:
#                 file:dict[str,str] = json.load(f)["questions"]

#             question: str = self.question.lower()

#             # get close matches from json file (n=1): number of matches to find
#             matches = get_close_matches(question, file.keys(), n=1)
#             if matches:
#                 matche = matches[0]
#                 if self.code != "en":
#                     translated: str = self.translate_to_user(f"{file[matche]}")
#                     self.response = (str(translated), self.code)
#                     # return str(file[matche])
#                 else:
#                     self.response = (str(file[matche]), "en")
#             else:
#                 self.response = (
#                     "sorry i don't have an answer for this Question, you can try to ask me somthing else",
#                     "en",
#                 )
#         else:
#             self.response = ("Connecting......", "en")

#     def get_reponse(self) -> tuple[str, str]:
#         "return the ai response as `(response, language)`"
#         return self.response

#     def translate_to_user(self, msg: str) -> str:
#         if self.code != "en":
#             try:
#                 return googletrans.Translator().translate(msg, dest=self.code).text # type: ignore
#             except:
#                 return msg
#         else:
#             return msg

#     def translate_to_ai(self, msg: str) -> str:
#         "the ai understands english only"
#         if self.code != "en":
#             return googletrans.Translator().translate(msg, dest="en").text # type: ignore
#         else:
#             return msg

#     def text_to_speach(self, text: str) -> str:
#         "Text To Speach using `gTTS` and encode it as `base64` for sending the audio file as plain text"
        
#         byte: io.BytesIO = io.BytesIO()
#         gTTS(text, lang=self.lang, tld=self.acc).write_to_fp(byte)
#         byte.seek(0)
#         audio_link: str = base64.b64encode(byte.getvalue()).decode()
#         return audio_link

import base64
from celery import shared_task
from asgiref.sync import async_to_sync
from utils.dtypes import encoded_files
from channels.layers import get_channel_layer
from django.core.files.base import ContentFile
from main_page.models import Post, PostContent

@shared_task
def save_post_media_content(files_data: encoded_files, post_id: int) -> None:
        """A Function to save the `PostContent`

        Args:
            files (encoded_files): the `Media` to add to he `PostContent`
            post (int): The `Post.id` itself to change
        """
        error: bool = False
        try:
            channel = get_channel_layer()
            contents: list[PostContent] = []
            post = Post.objects.get(id=post_id)
            channel_name = f"notif_{post.user.username.replace(" ", "")}_{post.user.pk}"
            
            for item in files_data:
                content_type = item["content_type"]
                file_name = item["name"]
                file_content = base64.b64decode(item["base64"])
                
                is_image: bool = content_type != None and content_type.startswith("image")
                is_video: bool = content_type != None and content_type.startswith("video")
                
                if content_type and not (is_image or is_video):
                    async_to_sync(channel.group_send)( # type: ignore
                        channel_name,
                        {
                            "type": "post.ready",
                            "message": "somthing went wrong, please try again",
                            "post_id": post_id,
                        }
                    )
                    return
                
                contents.append(
                    PostContent(
                        post=post,
                        image=ContentFile(file_content, file_name) if is_image else None,
                        video=ContentFile(file_content, file_name) if is_video else None,
                        content_type=PostContent.MediaType.IMAGE if is_image else PostContent.MediaType.VIDEO,
                        full_content_type=content_type
                    )
                )
            PostContent.objects.bulk_create(contents)
            
            async_to_sync(channel.group_send)( # type: ignore
                channel_name,
                {
                    "type": "post.ready",
                    "message": "Your Post Has been saved successfully, if you don't see it, please refresh the page",
                    "post_id": post_id,
                }
            )
        except Exception as e:
            error = True
            print(f"Error saving content: {e}")
        finally:
            if not error:
                if not post.ready: # type: ignore
                    post.ready = True # type: ignore
                post.save() # type: ignore
                

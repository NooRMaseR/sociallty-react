# Django
from django.core.files.uploadedfile import InMemoryUploadedFile, UploadedFile
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.db import transaction

# Restful API
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status

# my imports
from APIs.serializers import CommentSerializer, PostSerializer
from main_page.models import Post, PostContent, Comment
from utils.main_utils import extract_first_frame
from users.models import SocialUser
# from .AI import MaseR_Response
from io import BytesIO
import os


class PostApi(APIView):
    "`restful API` for handling post apis `GET` for getting the post info `POST` for adding a post `PUT` for updating the post `DELETE` for deleting the post"
    
    def get(self, _: Request, postID: int) -> Response:
        "`(API)` to get the post info and content (photos, videos)"

        post: Post = get_object_or_404(
            Post.objects
            .select_related('user')
            .prefetch_related("media", 'likes', 'comments')
            .annotate(
                comments_count=Count('comments'),
                likes_count=Count('likes')
            ), 
            id=postID
        )

        post_serializer = PostSerializer(post)
        return Response(post_serializer.data, status=200)
        
    def save_content(self, files: list[UploadedFile], post: Post) -> Response | None:
        """A Function to save the `PostContent` and creates a `poster` for the video if there are videos

        Args:
            files (list[UploadedFile]): the `Media` to add to he `PostContent`
            post (Post): The `Post` itself to change

        Returns:
            Response: `405` if no files found in the post, else `None`
        """
        
        
        for file in files:
            is_image: bool = file.content_type != None and file.content_type.startswith("image")
            is_video: bool = file.content_type != None and file.content_type.startswith("video")
            
            if file.content_type and not (is_image or is_video):
                return Response(status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
            
            post_content: PostContent = PostContent(
                post=post,
                content=file,
                content_type=PostContent.MediaType.IMAGE if is_image else PostContent.MediaType.VIDEO,
                full_content_type=file.content_type
            )
            post_content.save()

            if is_video:
                first_frame_io: BytesIO | None = extract_first_frame(post_content.content.path)

                if first_frame_io:
                    poster = InMemoryUploadedFile(
                        first_frame_io,
                        None,
                        f"{os.path.splitext(file.name)[0]}.webP",
                        file.content_type,
                        first_frame_io.tell(),
                        None,
                    )
                    post_content.poster = poster  # type: ignore
                    post_content.save()
        post.save()
    
    @transaction.atomic
    def post(self, request: Request) -> Response:
        "`(API)` for adding a post to the data"

        files: list[UploadedFile] = request.FILES.getlist("files")  # type: ignore
        desc: str | None = request.data.get("desc")  # type: ignore
        visibility: str | None = request.data.get("visibility")  # type: ignore

        if not (files or desc):
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        if visibility not in Post.PostVisibility.values:
            return Response(status=status.HTTP_400_BAD_REQUEST)
            
        my_user: SocialUser = SocialUser.objects.get(id=request.user.id, username=request.user)  # type: ignore
        post: Post = Post.objects.create(user=my_user, description=desc, visibility=Post.PostVisibility(visibility))

        if (res := self.save_content(files, post)) is Response:
            return res
        
        return Response(status=status.HTTP_201_CREATED)

    @transaction.atomic
    def put(self, request: Request) -> Response:
        """
        `API` for getting the edited post and applying the changes then redirect to the home page
        """

        postID: str = request.data.get("postID")  # type: ignore
        mediaID_to_delete: list[str] = request.data.getlist("delete_media")  # type: ignore
        mediaID_to_add: list[UploadedFile] = request.FILES.getlist("files")  # type: ignore
        visibility: str | None = request.data.get("visibility")  # type: ignore
        post_desc: str | None = request.data.get("desc")  # type: ignore

        if visibility not in Post.PostVisibility.values:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        PostContent.objects.filter(post__id=postID, id__in=mediaID_to_delete).delete()

        post: Post = get_object_or_404(Post, id=postID)
        
        if post_desc:
            post.description = post_desc
            
        if visibility is not None:
            post.visibility = Post.PostVisibility(visibility)  # type: ignore

        if (res := self.save_content(mediaID_to_add, post)) is Response:
            return res
        
        return Response(status=status.HTTP_200_OK)
    
    @transaction.atomic
    def delete(self, request: Request) -> Response:
        "`(API)` for removing a post using the post id"

        postID: str = request.data.get("postID")  # type: ignore
        try:
            post: Post = Post.objects.only("id", "user__id","likes__id","media__id", "comments__id").select_related("user").get(id=postID)
        except Post.DoesNotExist:
            return Response(
                {"errors": "post not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if post.user.id == request.user.id:  # type: ignore
            post.delete()
            return Response(status=200)

        return Response(status=status.HTTP_400_BAD_REQUEST)


class PostCommentAPI(APIView):
    "`Restful API` for Getting or Adding or Deleteing a post comment"

    def get(self, _: Request, ID: int) -> Response:
        """
        `(API)` to get the post comments

        Args:
            ID: the post id
        """

        try:
            post: Post = Post.objects.get(id=ID)
        except Post.DoesNotExist:
            return Response(
                {"errors": "post not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        comments = (
            Comment.objects.filter(post=post)
            .annotate(comment_likes_count=Count('comment_likes'))
            .only(
                "id",
                "content",
                "created_at",
                "user__username",
                "user_id",
            )
        )

        if not comments:
            return Response(status=status.HTTP_204_NO_CONTENT)
    
        comments_serializer = CommentSerializer(comments, many=True)
        return Response({"comments": comments_serializer.data, "post_user_id": post.user.id}, status=200)  # type: ignore


    def delete(self, request: Request, ID: int) -> Response:
        """
        `(API)` to for removing a post comment

        Args:
            ID: the comment id
        """

        
        try:
            comment: Comment = Comment.objects.only("id", "user__id", "post__user__id").select_related("user", "post__user").get(id=ID)
        except Comment.DoesNotExist:
            return Response(
                {"errors": "comment not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # check if the comment belong to that requested user or the post belong to that requested user
        if comment.user.id == request.user.id or comment.post.user.id == request.user.id:  # type: ignore
            comment.delete()
            return Response(status=200)

        return Response(
            {"errors": "ID cannot be empty"}, status=status.HTTP_400_BAD_REQUEST
        )

    def post(self, request: Request, ID: int) -> Response:
        """
        `(API)` for adding a post comment

        Args:
            ID: the post id
        """
        try:
            post: Post = Post.objects.get(id=ID)
        except Post.DoesNotExist:
            return Response(
                {"errors": "post not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        data: str = request.data.get("comment")  # type: ignore

        if not data:
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        comment: Comment = Comment.objects.create(post=post, user=request.user, content=data)
        comment_serializer = CommentSerializer(comment)
        return Response(comment_serializer.data, status=201)



@api_view(["POST"])
def add_like(request: Request, postID: str) -> Response:
    """
    `(API)` for adding a like to a post

    Args:
        postID: the post id
    """
    try:
        post: Post = Post.objects.prefetch_related("likes").get(id=postID)
    except Post.DoesNotExist:
        return Response({"errors": "post not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        post.likes.get(user=request.user, post=post).delete()  # type: ignore
        return Response({"created": False}, status=200)
    except:
        post.likes.create(user=request.user, post=post)  # type: ignore
        return Response({"created": True}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@transaction.atomic
def add_comment_like(request: Request, comment_id: int) -> Response:
    """
    `API` for adding a like to a comment

    args:
        comment_id: the comment id
    """
    comment: Comment
    created: bool
    
    try:
        comment_to_like: Comment = Comment.objects.get(id=comment_id)
        comment, created = comment_to_like.comment_likes.get_or_create(user=request.user, comment=comment_to_like) # type: ignore
        if not created:
            comment.delete()
            
        return Response({"status": True, "created": created})
    except Comment.DoesNotExist:
        return Response(
            {"errors": "comment not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["DELETE"])
def remove_user(request: Request) -> Response:
    "`API` for removing the user account from the database"

    password: str = request.data.get("password")  # type: ignore
    # user: SocialUser = get_object_or_404(SocialUser.objects.select_related("auth_token"), id=request.user.id)  # type: ignore

    if password and request.user.check_password(password):  # type: ignore
        request.user.delete()
        return Response({"accept": True, "reson": "valid password"})

    return Response(
        {"accept": False, "reson": "wrong password"}, status=status.HTTP_400_BAD_REQUEST
    )

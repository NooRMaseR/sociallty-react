# Django
from django.core.files.uploadedfile import UploadedFile
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.db import transaction

# Restful API
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status

# my imports
from main_page.models import Post, PostContent, Comment
from APIs.serializers import CommentSerializer
from drf_yasg.utils import swagger_auto_schema
from users.models import SocialUser
from drf_yasg import openapi

    
class PostApi(APIView):
    "`restful API` for handling post apis `POST` for adding a post `PUT` for updating the post `DELETE` for deleting the post"
    parser_classes = (MultiPartParser, )
    
    def save_content(self, files: list[UploadedFile], post: Post) -> Response | None:
        """A Function to save the `PostContent`

        Args:
            files (list[UploadedFile]): the `Media` to add to he `PostContent`
            post (Post): The `Post` itself to change

        Returns:
            Response: `415` if no files found in the post, else `None`
        """
        
        try:
            contents: list[PostContent] = []
            for file in files:
                is_image: bool = file.content_type != None and file.content_type.startswith("image")
                is_video: bool = file.content_type != None and file.content_type.startswith("video")
                
                if file.content_type and not (is_image or is_video):
                    return Response(status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
                
                contents.append(
                    PostContent(
                        post=post,
                        image=file if is_image else None,
                        video=file if is_video else None,
                        content_type=PostContent.MediaType.IMAGE if is_image else PostContent.MediaType.VIDEO,
                        full_content_type=file.content_type
                    )
                )
            PostContent.objects.bulk_create(contents)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    
    @swagger_auto_schema(
        manual_parameters=[
          openapi.Parameter(
            "files",
            openapi.IN_FORM,
            type=openapi.TYPE_ARRAY,
            items=openapi.Items(type=openapi.TYPE_FILE),
            description="The files to add to the post",
            required=False
          ),
          openapi.Parameter(
            "desc",
            openapi.IN_FORM,
            type=openapi.TYPE_STRING,
            description="The description of the post",
            required=False
          ),
          openapi.Parameter(
            "visibility",
            openapi.IN_FORM,
            type=openapi.TYPE_STRING,
            enum=Post.PostVisibility.values,
            description="The visibility of the post",
            default=Post.PostVisibility.PUBLIC,
            required=True
          )
        ],
        responses={
            201: openapi.Response(
                description="Post created successfully",
            ),
            400: openapi.Response(
                description="Invalid request",
            ),
            415: openapi.Response(
                description="Unsupported media type",
            )
        },
    )
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


    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "postID",
                openapi.IN_FORM,
                type=openapi.TYPE_INTEGER,
                description="The ID of the post to update",
                required=True
            ),
            openapi.Parameter(
                "delete_media",
                openapi.IN_FORM,
                type=openapi.TYPE_ARRAY,
                items=openapi.Items(type=openapi.TYPE_INTEGER),
                description="The IDs of the media to delete",
                required=False
            ),
            openapi.Parameter(
                "files",
                openapi.IN_FORM,
                type=openapi.TYPE_ARRAY,
                items=openapi.Items(type=openapi.TYPE_FILE),
                description="The files to add to the post",
                required=False
            ),
            openapi.Parameter(
                "visibility",
                openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                enum=Post.PostVisibility.values,
                description="The visibility of the post",
                required=True
            ),
            openapi.Parameter(
                "desc",
                openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                description="The description of the post",
                required=False
            )
        ],
        responses={
            200: openapi.Response(
                description="Post updated successfully",
            ),
            400: openapi.Response(
                description="Invalid request",
            ),
            415: openapi.Response(
                description="Unsupported media type",
            )
        }
    )
    @transaction.atomic
    def put(self, request: Request) -> Response:
        """
        `API` for editing post
        """
        try:
            postID: str = request.data.get("postID")  # type: ignore
            mediaID_to_delete: list[str] = request.data.get("delete_media", [])  # type: ignore
            mediaID_to_add: list[UploadedFile] = request.FILES.get("files", [])  # type: ignore
            visibility: str | None = request.data.get("visibility")  # type: ignore
            post_desc: str | None = request.data.get("desc")  # type: ignore
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
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
        
        post.save()
        return Response(status=status.HTTP_200_OK)
    
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "postID",
                openapi.IN_FORM,
                type=openapi.TYPE_INTEGER,
                description="The ID of the post to delete",
                required=True
            )
        ],
        responses={
            200: openapi.Response(
                description="Post deleted successfully",
            ),
            404: openapi.Response(
                description="Post not found",
            ),
            500: openapi.Response(
                description="Internal server error",
            )
        }
    )
    @transaction.atomic
    def delete(self, request: Request) -> Response:
        "`(API)` for removing a post using the post id"

        postID: str = request.data.get("postID")  # type: ignore
        try:
            post: Post = Post.objects.only("id", "user__id").select_related("user").get(id=postID)
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

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "ID",
                openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                description="The ID of the post to get the comments for",
            )
        ],
        required=['ID'],
        responses={
            200: openapi.Response(
                description="Post comments fetched successfully",
            ),
            204: openapi.Response(
                description="No comments found",
            ),
            404: openapi.Response(
                description="Post not found",
            ),
            500: openapi.Response(
                description="Internal server error",
            )
        }
    )
    def get(self, _: Request, ID: int) -> Response:
        """
        `(API)` to get the post comments

        Args:
            ID: the post id
        """

        try:
            post: Post = Post.objects.select_related('user').get(id=ID)
        except Post.DoesNotExist:
            return Response(
                {"errors": "post not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        comments = (
            Comment.objects
            .select_related('user')
            .filter(post=post)
            .annotate(comment_likes_count=Count('comment_likes'))
            .only(
                "id",
                "content",
                "created_at",
                "user__username",
                "user__first_name",
                "user__last_name",
                "user__profile_picture",
                "user_id",
            )
        )

        if not comments:
            return Response(status=status.HTTP_204_NO_CONTENT)
    
        comments_serializer = CommentSerializer(comments, many=True)
        return Response({"comments": comments_serializer.data, "post_user_id": post.user.id}, status=200)  # type: ignore


    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "ID",
                openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                description="The ID of the comment to delete",
            )
        ],
        required=['ID'],
        responses={
            200: openapi.Response(
                description="Comment deleted successfully",
            ),
            404: openapi.Response(
                description="Comment not found",
            ),
            500: openapi.Response(
                description="Internal server error",
            )
        }
    )
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


    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                "ID",
                openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                description="The ID of the post to add a comment to",
            ),
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "comment": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="The comment to add to the post",
                    default="",
                )
            }
        ),
        responses={
            201: openapi.Response(
                description="Comment added successfully",
            ),
            204: openapi.Response(
                description="No comment added",
            ),
            404: openapi.Response(
                description="Post not found",
            ),
            500: openapi.Response(
                description="Internal server error",
            )
        }
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


class PostLikeAPI(APIView):
    
    @swagger_auto_schema(
            manual_parameters=[
                openapi.Parameter(
                    "postID",
                    openapi.IN_PATH,
                    type=openapi.TYPE_INTEGER,
                    description="The ID of the post to add a like to",
                )
            ],
            responses={
                201: openapi.Response(
                    description="Like added successfully",
                    schema=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "created": openapi.Schema(
                                type=openapi.TYPE_BOOLEAN,
                                description="Whether the like was created or not"
                            )
                        }
                    )
                ),
                200: openapi.Response(
                    description="Undo the like",
                    schema=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "created": openapi.Schema(
                                type=openapi.TYPE_BOOLEAN,
                                description="Whether the like was created or not"
                            )
                        }
                    )
                ),
                404: openapi.Response(
                    description="Post not found",
                    schema=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "errors": openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description="The error message"
                            )
                        }
                    )
                ),
                500: openapi.Response(
                    description="Internal server error",
                    schema=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "errors": openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description="The error message"
                            )
                        }
                    )
                )
            }
        )
    def post(self, request: Request, postID: str) -> Response:
        """
        `(API)` for adding a like to a post, if the like already exists, it will be removed

        Args:
            postID: the post id
        """
        try:
            post: Post = Post.objects.get(id=postID)
        except Post.DoesNotExist:
            return Response({"errors": "post not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        like, created = post.likes.get_or_create(user=request.user, post=post)  # type: ignore
        if created:
            return Response({"created": True}, status=status.HTTP_201_CREATED)
        else:
            like.delete()
            return Response({"created": False}, status=200)


class CommentLikeAPI(APIView):

    @swagger_auto_schema(
            manual_parameters=[
                openapi.Parameter(
                    "comment_id",
                    openapi.IN_PATH,
                    type=openapi.TYPE_INTEGER,
                    description="The ID of the comment to add a like to",
                )
            ],
            responses={
                201: openapi.Response(
                    description="Like added successfully",
                    schema=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "created": openapi.Schema(type=openapi.TYPE_BOOLEAN)
                        }
                    )
                ),
                404: openapi.Response(
                    description="Comment not found",
                    schema=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "errors": openapi.Schema(type=openapi.TYPE_STRING)
                        }
                    )
                ),
                500: openapi.Response(
                    description="Internal server error", 
                    schema=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "errors": openapi.Schema(type=openapi.TYPE_STRING)
                        }
                    )
                )
            }
        )
    @transaction.atomic
    def post(self, request: Request, comment_id: int) -> Response:
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
                
            return Response({"created": created}, status=status.HTTP_201_CREATED)
        except Comment.DoesNotExist:
            return Response(
                {"errors": "comment not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RemoveUserAPI(APIView):
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "password": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Your password"
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="User account removed successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "accept": openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        "reson": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: openapi.Response(
                description="Invalid password",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "accept": openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        "reson": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            )
        }
    )
    def delete(self, request: Request) -> Response:
        "`API` for removing the user account (be careful with this)"

        password: str = request.data.get("password")  # type: ignore

        if password and request.user.check_password(password):  # type: ignore
            request.user.delete()
            return Response({"accept": True, "reson": "valid password"})

        return Response(
            {"accept": False, "reson": "wrong password"}, status=status.HTTP_400_BAD_REQUEST
        )

# Django
from django.core.files.uploadedfile import UploadedFile
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.db import transaction

# Restful API
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status

# my imports
from main_page.models import Post, PostContent, Comment
from utils.main_utils import encode_uploaded_files
from APIs.serializers import CommentSerializer
from drf_yasg.utils import swagger_auto_schema
from .tasks import save_post_media_content
from users.models import SocialUser
from drf_yasg import openapi
from .models import Report

    
class PostApi(APIView):
    "`restful API` for handling post apis `POST` for adding a post `PUT` for updating the post `DELETE` for deleting the post"
    parser_classes = (MultiPartParser, JSONParser)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["visibility"],
            properties={
                "files": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_FILE),
                    description="The files to add to the post",
                ),
                "desc": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="The description of the post"
                ),
                "visibility": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=list(Post.PostVisibility.values),
                    description="The visibility of the post",
                    default=Post.PostVisibility.PUBLIC,
                )
            }
        ),
        responses={
            200: openapi.Response(description="Post is creating in the background"),
            400: openapi.Response(description="Invalid request"),
            415: openapi.Response(description="Unsupported media type"),
        }
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
        post: Post = Post.objects.create(user=my_user, description=desc, visibility=Post.PostVisibility(visibility), ready=False)

        save_post_media_content.delay(encode_uploaded_files(files), post.id)  # type: ignore
        
        return Response({"details": "creating in the background"}, status=status.HTTP_200_OK)


    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["postID", "visibility"],
            properties={
                "postID": openapi.Schema(
                type=openapi.TYPE_INTEGER,
                description="The ID of the post to update",
            ),
                "delete_media": openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Items(type=openapi.TYPE_INTEGER),
                description="The IDs of the media to delete",
            ),
                "files": openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Items(type=openapi.TYPE_FILE),
                description="The files to add to the post",
            ),
                "visibility": openapi.Schema(
                type=openapi.TYPE_STRING,
                enum=Post.PostVisibility.values,
                description="The visibility of the post",
            ),
                "desc": openapi.Schema(
                type=openapi.TYPE_STRING,
                description="The description of the post",
            )
            }
        ),
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

        save_post_media_content.delay(encode_uploaded_files(mediaID_to_add), post.id)  # type: ignore
        return Response(status=status.HTTP_200_OK)
    
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["postID"],
            properties={
                "postID": openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description="The ID of the post to delete",
                )
            }
        ),
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


class UserReportAPI(APIView):
    "`API` for reporting a user"

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "user_id": openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description="The ID of the user to report it"
                ),
                "reason": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="The reason for reporting the user"
                )
            }
        ),
        responses={
            201: openapi.Response(
                description="User reported successfully",
            ),
            400: openapi.Response(
                description="Invalid request",
            ),
            404: openapi.Response(
                description="User not found",
            ),
            208: openapi.Response(
                description="User Already Reported",
            ),
        }
    )
    def post(self, request: Request) -> Response:
        """
        `API` for reporting a user
        """
        user_id: int = request.data.get("user_id")  # type: ignore
        reason: str = request.data.get("reason")  # type: ignore

        if not user_id or not reason:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            Report.objects.create(user_reported=request.user, user_id=user_id, reason=reason)
        except:
            return Response(status=status.HTTP_208_ALREADY_REPORTED)

        return Response(status=status.HTTP_201_CREATED)
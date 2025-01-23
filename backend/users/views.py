# from django.views.decorators.http import require_GET 
# from django.http import HttpRequest, HttpResponse
# from django.shortcuts import render, redirect
# from django.contrib import auth


# # Create your views here.
# @require_GET
# def login(request: HttpRequest) -> HttpResponse:
#     "log in view"

#     # if the user is is authenticated (is logged in already) then redirect to the home page
#     if request.user.is_authenticated:
#         return redirect("home")

#     # else return the login view to log in the user
#     return render(
#         request,
#         "login.html",
#         {
#             "title": "Login",
#             "nav_title": "Login To Sociallty",
#             "csss": ["login", "nav-simple"],
#             "jss": ["login"],
#         },
#     )


# @require_GET
# def logout(request: HttpRequest) -> HttpResponse:
#     "`view` for logging out the user"
#     auth.logout(request)
#     return redirect("login-page")


# @require_GET
# def signup_view(request: HttpRequest) -> HttpResponse:
#     "Sign up View"

#     # if the user is authenticated, redirect to the home page
#     if request.user.is_authenticated:
#         return redirect("home")

#     # else return the signup view to create a new account
#     return render(
#         request,
#         "signup.html",
#         {
#             "title": "Signup",
#             "nav_title": "Signup To Sociallty",
#             "csss": ["signup", "nav-simple"],
#             "jss": ["signup"],
#         },
#     )


# @require_GET
# def forget_password_view(request: HttpRequest) -> HttpResponse:
#     "`View` for get user email for change his forgotten password"

#     return render(
#         request,
#         "forget-password.html",
#         {"csss": ["login", "nav-simple"], "jss": ["forget-password"]},
#     )


# @require_GET
# def change_password_view(request: HttpRequest, email: str, id: int, secure) -> HttpResponse:
#     "`View` for changing password of a user"

#     if email and id and secure == "true":
#         return render(
#             request,
#             "change-user-password.html",
#             {"csss": ["login", "nav-simple"], "jss": ["change-password"]},
#         )

#     return HttpResponse("Error")

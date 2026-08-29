from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [
    # Auth
    path("auth/signup/", views.signup_view, name="signup"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/guest/", views.guest_login_view, name="guest_login"),
    path("auth/me/", views.current_user_view, name="current_user"),

    # Projects
    path("projects/", views.project_list_create, name="project_list_create"),
    path("projects/<int:pk>/", views.project_detail, name="project_detail"),

    # Tasks
    path("tasks/", views.task_list_create, name="task_list_create"),
    path("tasks/<int:pk>/", views.task_detail, name="task_detail"),
    path("tasks/<int:pk>/toggle/", views.task_toggle_complete, name="task_toggle_complete"),
    path("tasks/<int:pk>/subtasks/", views.task_add_subtask, name="task_add_subtask"),

    # Stats
    path("stats/", views.productivity_stats, name="productivity_stats"),
]
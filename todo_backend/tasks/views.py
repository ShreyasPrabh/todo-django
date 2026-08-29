from datetime import timedelta
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Task, Project
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ProjectSerializer,
    TaskSerializer,
    SubTaskSerializer,
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def get_request_user(request):
    if request.user and request.user.is_authenticated:
        return request.user
    # Fallback to demo/guest user if available, or None
    demo_user = User.objects.filter(username__in=["demo_guest", "demo"]).first()
    return demo_user


# ---------------- AUTH VIEWS ---------------- #

@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "tokens": tokens,
            "message": "User registered successfully",
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def guest_login_view(request):
    user, created = User.objects.get_or_create(
        username="demo_guest",
        defaults={"email": "demo@todoist.local", "first_name": "Demo", "last_name": "User"}
    )
    if created:
        user.set_password("demopassword123")
        user.save()
        # Seed initial sample data for demo user
        work_project = Project.objects.create(user=user, name="Work & Career", color="#246fe0", is_favorite=True)
        personal_project = Project.objects.create(user=user, name="Personal Goals", color="#299438", is_favorite=True)
        today = timezone.localdate()

        Task.objects.create(
            user=user,
            title="👋 Welcome to your Todoist clone!",
            description="Explore features like priority flags, projects, subtasks, and keyboard shortcuts (Press 'Q' to Quick Add, 'Ctrl+K' to Search).",
            due_date=today,
            priority=1,
        )
        t2 = Task.objects.create(
            user=user,
            project=work_project,
            title="Prepare quarterly presentation",
            description="Include performance charts and key milestones.",
            due_date=today,
            priority=2,
        )
        Task.objects.create(user=user, parent_task=t2, title="Gather analytics data", completed=True, completed_at=timezone.now())
        Task.objects.create(user=user, parent_task=t2, title="Design keynote slides", completed=False)
        Task.objects.create(
            user=user,
            project=personal_project,
            title="Morning run 5km 🏃‍♂️",
            due_date=today + timedelta(days=1),
            priority=3,
        )

    tokens = get_tokens_for_user(user)
    return Response({
        "user": UserSerializer(user).data,
        "tokens": tokens,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def current_user_view(request):
    user = get_request_user(request)
    if user:
        return Response(UserSerializer(user).data)
    return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)


# ---------------- PROJECT VIEWS ---------------- #

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def project_list_create(request):
    user = get_request_user(request)
    if not user:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        projects = Project.objects.filter(user=user)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def project_detail(request, pk):
    user = get_request_user(request)
    if not user:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    project = get_object_or_404(Project, id=pk, user=user)

    if request.method == "GET":
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    elif request.method in ["PUT", "PATCH"]:
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        project.delete()
        return Response({"message": "Project deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# ---------------- TASK VIEWS ---------------- #

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def task_list_create(request):
    user = get_request_user(request)
    if not user:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        view_filter = request.GET.get("view", "inbox")
        search_query = request.GET.get("search", "").strip()
        project_id = request.GET.get("project_id") or request.GET.get("projectId")
        priority_val = request.GET.get("priority")
        include_completed = request.GET.get("include_completed", "true").lower() in ["true", "1"]
        today = timezone.localdate()

        # Only get top-level tasks (subtasks are nested)
        queryset = Task.objects.filter(user=user, parent_task__isnull=True)

        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | Q(description__icontains=search_query)
            )
        elif view_filter == "inbox":
            queryset = queryset.filter(project__isnull=True)
            if not include_completed:
                queryset = queryset.filter(completed=False)
        elif view_filter == "today":
            if include_completed:
                queryset = queryset.filter(Q(due_date__lte=today) | Q(completed=True, completed_at__date=today))
            else:
                queryset = queryset.filter(completed=False, due_date__lte=today)
        elif view_filter == "upcoming":
            queryset = queryset.filter(due_date__gte=today)
            if not include_completed:
                queryset = queryset.filter(completed=False)
        elif view_filter == "completed":
            queryset = queryset.filter(completed=True).order_by("-completed_at")
        elif (view_filter == "project" or project_id) and project_id:
            queryset = queryset.filter(project_id=project_id)
            if not include_completed:
                queryset = queryset.filter(completed=False)
        elif (view_filter == "priority" or priority_val) and priority_val:
            queryset = queryset.filter(priority=int(priority_val))
            if not include_completed:
                queryset = queryset.filter(completed=False)

        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def task_detail(request, pk):
    user = get_request_user(request)
    if not user:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    task = get_object_or_404(Task, id=pk, user=user)

    if request.method == "GET":
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    elif request.method in ["PUT", "PATCH"]:
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            updated_task = serializer.save()
            if "status" in request.data:
                if request.data["status"] == "completed" and not updated_task.completed:
                    updated_task.completed = True
                    updated_task.completed_at = timezone.now()
                    updated_task.save()
                elif request.data["status"] in ["todo", "inprogress"] and updated_task.completed:
                    updated_task.completed = False
                    updated_task.completed_at = None
                    updated_task.save()
            return Response(TaskSerializer(updated_task).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        task.delete()
        return Response({"message": "Task deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([AllowAny])
def task_toggle_complete(request, pk):
    user = get_request_user(request)
    if not user:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    task = get_object_or_404(Task, id=pk, user=user)
    task.completed = not task.completed
    task.completed_at = timezone.now() if task.completed else None
    if task.completed:
        task.status = "completed"
    else:
        if task.status == "completed":
            task.status = "todo"
    task.save()
    return Response(TaskSerializer(task).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def task_add_subtask(request, pk):
    user = get_request_user(request)
    if not user:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    parent_task = get_object_or_404(Task, id=pk, user=user)
    title = request.data.get("title", "").strip()
    if not title:
        return Response({"error": "Subtask title is required"}, status=status.HTTP_400_BAD_REQUEST)

    subtask = Task.objects.create(
        user=user,
        parent_task=parent_task,
        title=title,
        project=parent_task.project,
        priority=4,
    )
    return Response(SubTaskSerializer(subtask).data, status=status.HTTP_201_CREATED)


# ---------------- PRODUCTIVITY & STATS ---------------- #

@api_view(["GET"])
@permission_classes([AllowAny])
def productivity_stats(request):
    user = get_request_user(request)
    if not user:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    today = timezone.localdate()
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)

    all_user_tasks = Task.objects.filter(user=user, parent_task__isnull=True)
    today_completed = all_user_tasks.filter(completed=True, completed_at__gte=today_start).count()
    week_completed = all_user_tasks.filter(completed=True, completed_at__gte=week_start).count()
    total_completed = all_user_tasks.filter(completed=True).count()
    total_pending = all_user_tasks.filter(completed=False).count()

    # Calculate streak days
    streak = 0
    check_day = today
    while True:
        completed_on_day = all_user_tasks.filter(
            completed=True,
            completed_at__date=check_day
        ).exists()
        if completed_on_day:
            streak += 1
            check_day = check_day - timedelta(days=1)
        else:
            # If checking today and no completions yet, check yesterday to keep active streak
            if check_day == today:
                check_day = check_day - timedelta(days=1)
                continue
            break

    # Calculate Karma points (sample formula: total completed * 10 + streak * 25)
    karma = 100 + (total_completed * 10) + (streak * 25)
    karma_level = "Novice"
    if karma >= 1000:
        karma_level = "Grandmaster"
    elif karma >= 500:
        karma_level = "Master"
    elif karma >= 250:
        karma_level = "Expert"
    elif karma >= 150:
        karma_level = "Intermediate"

    return Response({
        "today_completed": today_completed,
        "daily_goal": 5,
        "week_completed": week_completed,
        "weekly_goal": 25,
        "total_completed": total_completed,
        "total_pending": total_pending,
        "streak_days": streak,
        "karma_points": karma,
        "karma_level": karma_level,
    })

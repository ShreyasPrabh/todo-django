from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Task, Project


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=4)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


class ProjectSerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    completed_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["id", "name", "color", "is_favorite", "task_count", "completed_count", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_task_count(self, obj):
        return obj.tasks.filter(parent_task__isnull=True, completed=False).count()

    def get_completed_count(self, obj):
        return obj.tasks.filter(parent_task__isnull=True, completed=True).count()


class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", "completed", "completed_at", "order", "created_at"]
        read_only_fields = ["id", "created_at"]


class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubTaskSerializer(many=True, read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)
    project_color = serializers.CharField(source="project.color", read_only=True)
    is_overdue = serializers.SerializerMethodField()
    subtask_total = serializers.SerializerMethodField()
    subtask_completed = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "due_date",
            "due_time",
            "priority",
            "status",
            "completed",
            "completed_at",
            "project",
            "project_name",
            "project_color",
            "parent_task",
            "order",
            "subtasks",
            "subtask_total",
            "subtask_completed",
            "is_overdue",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_is_overdue(self, obj):
        if not obj.completed and obj.due_date:
            today = timezone.localdate()
            return obj.due_date < today
        return False

    def get_subtask_total(self, obj):
        return obj.subtasks.count()

    def get_subtask_completed(self, obj):
        return obj.subtasks.filter(completed=True).count()

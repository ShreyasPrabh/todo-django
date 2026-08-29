from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="projects")
    name = models.CharField(max_length=120)
    color = models.CharField(max_length=30, default="#db4035")  # Todoist red default
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-is_favorite", "name"]

    def __str__(self):
        return self.name


class Task(models.Model):
    PRIORITY_CHOICES = (
        (1, "Priority 1 (Urgent)"),
        (2, "Priority 2 (High)"),
        (3, "Priority 3 (Medium)"),
        (4, "Priority 4 (Normal)"),
    )

    STATUS_CHOICES = (
        ("todo", "To Do"),
        ("inprogress", "In Progress"),
        ("completed", "Completed"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="tasks")
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    parent_task = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="subtasks",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    due_date = models.DateField(null=True, blank=True)
    due_time = models.TimeField(null=True, blank=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="todo")
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "due_date", "priority", "-created_at"]

    def __str__(self):
        return self.title

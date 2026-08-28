from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Task
from .serializers import TaskSerializer


@api_view(["GET", "POST"])
def task_list(request):

    if request.method == "GET":

        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors)

@api_view(["GET", "PUT","PATCH","DELETE"])
def task_detail(request, pk):

    task = get_object_or_404(Task, id=pk)

    if request.method == "GET":

        serializer = TaskSerializer(task)
        return Response(serializer.data)

    elif request.method == "PUT":

        serializer = TaskSerializer(
            task,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)
    
    elif request.method == "PATCH":

        serializer = TaskSerializer(
            task,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)

    elif request.method == "DELETE":

        task.delete()

        return Response({
            "message": "Task deleted successfully"
        })



from django.shortcuts import render
from tasks.lib.forms.TasksEditForm import *
from tasks.drm.mapper_values import Visibility

def dashboard(request):
    """
        Render the tasks dashboard (tabbed view).
    """
    context = {
        'form': TasksEditForm(),
    }
    return render(request, 'tasks/index.html', context)


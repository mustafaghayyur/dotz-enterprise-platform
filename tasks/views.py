from django.shortcuts import render
from tasks.lib.forms.TasksEditForm import *
from tasks.lib.forms.WorkSpaceEditForm import *

def dashboard(request):
    """
        Render the tasks dashboard (tabbed view).
    """
    context = {
        'taskForm': TasksEditForm(),
        'workspaceForm': WorkSpaceEditForm(),
    }
    return render(request, 'tasks/index.html', context)


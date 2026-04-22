from django.shortcuts import render
from tasks.lib.forms.TasksEditForm import *
from tasks.lib.forms.WorkSpaceEditForm import *
from tasks.lib.forms.WorkSpaceLifeCycleForm import *
from tasks.lib.forms.WorkSpaceUsersForm import *


def dashboard(request):
    """
        Render the tasks dashboard (tabbed view).
    """
    context = {
        'taskForm': TasksEditForm(),
        'workspaceForm': WorkSpaceEditForm(),
        'workspaceLifeCyclesForm': WorkSpaceLifeCyclesEditForm(),
        'workspaceUserSettingsForm': WorkSpaceUserSettingsEditForm(),
    }
    return render(request, 'tasks/index.html', context)


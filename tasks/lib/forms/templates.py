from django import forms
from core.lib.FormsParent import Forms
from tasks.models import *
from core.helpers import crud


class WorkSpacesEditForm(Forms):
    wowo_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    name = forms.CharField(max_length=1000, required=False)
    description = forms.CharField(widget=forms.Textarea, required=False)
    type = forms.CharField(max_length=30, required=False)
    creator_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    wowo_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wowo_update_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wowo_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wolc_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    start = forms.DateTimeField(required=False, widget=crud.DateTimeLocalInput())
    end = forms.DateTimeField(required=False, widget=crud.DateTimeLocalInput())
    interval_length = forms.IntegerField(required=False)
    interval_type = forms.CharField(max_length=50, required=False)
    life_cycle_type = forms.CharField(max_length=50, required=False)
    wolc_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wolc_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wolc_latest = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class WorkSpaceDepartmentsEditForm(Forms):
    wode_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    department_id = forms.ModelChoiceField(queryset=Department.objects.none(), required=False)
    workspace_id = forms.ModelChoiceField(queryset=WorkSpace.objects.none(), required=False)
    wode_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wode_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wode_latest = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class WorkSpaceUsersEditForm(Forms):
    wous_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    user_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    workspace_id = forms.ModelChoiceField(queryset=WorkSpace.objects.none(), required=False)
    wous_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wous_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wous_latest = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class WorkSpaceTermsEditForm(Forms):
    wote_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    workspace_id = forms.ModelChoiceField(queryset=WorkSpace.objects.none(), required=False)
    parent_id = forms.ModelChoiceField(queryset=WorkSpaceTerm.objects.none(), required=False, empty_label="Select One", label="Parent WorkSpaceTerm")
    term = forms.CharField(max_length=200, required=False)
    term_description = forms.CharField(widget=forms.Textarea, required=False)
    wote_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wote_update_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    wote_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class TasksEditForm(Forms):
    tata_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    description = forms.CharField(widget=forms.Textarea, required=False)
    creator_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    parent_id = forms.ModelChoiceField(queryset=Task.objects.none(), required=False, empty_label="Select One", label="Parent Task")
    tata_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tata_update_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tata_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tade_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    details = forms.CharField(required=False)
    tade_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    tade_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tade_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tadl_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    deadline = forms.DateTimeField(required=False, widget=crud.DateTimeLocalInput())
    tadl_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    tadl_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tadl_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tast_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    status = forms.CharField(max_length=20, required=False)
    tast_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    tast_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tast_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tavi_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    visibility = forms.CharField(max_length=20, required=False)
    tavi_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    tavi_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tavi_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    taas_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    assignor_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    assignee_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    taas_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    taas_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    taas_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tawo_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    workspace_id = forms.ModelChoiceField(queryset=WorkSpace.objects.none(), required=False)
    tawo_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tawo_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tawo_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    tate_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    term_id = forms.ModelChoiceField(queryset=WorkSpaceTerm.objects.none(), required=False)
    tate_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tate_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tate_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    tapo_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    points = forms.IntegerField(required=False)
    tapo_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tapo_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tapo_latest = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class TaskWatchersEditForm(Forms):
    tawa_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    task_id = forms.ModelChoiceField(queryset=Task.objects.none(), required=False)
    watcher_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    tawa_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    tawa_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tawa_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class UserPointsForTasksEditForm(Forms):
    taup_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    rating = forms.IntegerField(required=False)
    task_id = forms.ModelChoiceField(queryset=Task.objects.none(), required=False)
    contributor_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    taup_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    taup_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    taup_latest = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class TaskCommentsEditForm(Forms):
    taco_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    task_id = forms.ModelChoiceField(queryset=Task.objects.none(), required=False)
    comment = forms.CharField(widget=forms.Textarea, required=False)
    response_to_id = forms.ModelChoiceField(queryset=TaskComment.objects.none(), required=False)
    commenter_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    taco_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    taco_update_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    taco_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


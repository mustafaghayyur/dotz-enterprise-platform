from django.contrib.auth import get_user_model
from django import forms

from .templates import TasksEditForm
from tasks.models import *
from users.models import *
from tasks.drm.mapper_values import Status
from core.helpers import crud

class TasksEditForm(TasksEditForm):
    """
        Setup Task Edit Form.
    """ 
    #field_order = ['assignor_id', 'assignee_id', 'points', 'term_id']
    workspace_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    visibility = forms.CharField(widget=forms.HiddenInput(), required=True)

    description = forms.CharField(max_length=2000,  label="Name of Task", help_text="Name can be a 2000 char brief description of Task.")
    assignor_id = forms.ModelChoiceField(queryset=User.objects.none(), label="Assignor", empty_label="Select One", help_text="Set assignor for Task.")
    assignee_id = forms.ModelChoiceField(queryset=User.objects.none(), label="Assignee", empty_label="Select One", help_text="Name of user to be assigned to task.")
        
    details = forms.CharField(widget=forms.Textarea, help_text="Enter a full-length description for this task. No char limit. Attachments can be added seperately below.")
    deadline = forms.DateTimeField(required=False, widget=crud.DateTimeLocalInput(), help_text="When a deadline has been decided, you can fill time and date here.")

    status = forms.ChoiceField(
        choices=[(item.name, item.value.replace('_', ' ').title()) for item in Status],
        help_text="Select the current status of the task"
    )
    parent_id = forms.ModelChoiceField(queryset=Task.objects.none(), required=False, empty_label="Select One", label="Parent Task", help_text="If this Task is a child of another Task, you can link to the parent task with this select option.")

    # reset some un-needed terms
    tapo_id = None
    points = None
    tapo_create_time = None
    tapo_delete_time = None
    tapo_latest = None
    tate_id = None
    term_id = None
    tate_create_time = None
    tate_delete_time = None
    tate_latest = None

    def performSetup(self):
        self.fields['assignor_id'].widget.attrs['class'] += ' mini-field mf-first'
        self.fields['assignee_id'].widget.attrs['class'] += ' mini-field mf-second'
        


class TasksProjectSubForm():
    """
        Setup Task Project Level Form.
    """ 
    tate_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    term_id = forms.ModelChoiceField(queryset=WorkSpaceTerm.objects.none(), required=False)
    tate_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tate_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tate_latest = forms.CharField(widget=forms.HiddenInput(), required=False)

    tata_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    tapo_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    points = forms.IntegerField(required=False)
    tapo_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tapo_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    tapo_latest = forms.CharField(widget=forms.HiddenInput(), required=False)

    # these will be handled in the front-end component:
    rating = forms.IntegerField(required=False)
    contributor_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
        

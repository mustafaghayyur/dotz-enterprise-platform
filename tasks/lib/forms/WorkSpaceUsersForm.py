from django.contrib.auth import get_user_model
from django import forms

from core.lib.FormsParent import Forms
from tasks.drm.mapper_values import *
from users.models import User, Department
from core.helpers import crud

class WorkSpaceUserSettingsEditForm(Forms):
    wowo_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    department_id = forms.ModelMultipleChoiceField(
        queryset=Department.objects.none(),
        required=False,
        label="Departments",
        widget=forms.SelectMultiple(attrs={'size': 6}),
        help_text='Select all departments that have access relations to this WorkSpace.'
    )
    
    lead_id = forms.ModelChoiceField(queryset=User.objects.none(), label="Team Leader", help_text="Select Initial Team Lead. More team-leaders and team-members can be added after the WorkSpace has been created.")
    
    def performSetup(self):
        # self.fields['foo'].widget.attrs['class'] += ' mini-field'
        pass
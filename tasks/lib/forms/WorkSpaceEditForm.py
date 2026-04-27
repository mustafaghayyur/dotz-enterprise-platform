from django.contrib.auth import get_user_model
from django import forms

from core.lib.FormsParent import Forms
from tasks.drm.mapper_values import *
from core.helpers import crud
from users.models import User, Department

class WorkSpaceEditForm(Forms):
    """
        Setup WorkSpace Edit Form.
    """ 
    wowo_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    
    name = forms.CharField(max_length=1000, help_text='Enter an identifiable and meaningful name for this WorkSpace. Maximum 1000 chars.')
    type = forms.ChoiceField(
        choices=[(item.name, item.value.replace('_', ' ').title()) for item in WSType],
        widget=forms.RadioSelect(),
        initial='open',
        help_text="Choose type of WorkSpace"
    )
    
    description = forms.CharField(widget=forms.Textarea, help_text="A brief description outlining pertinent information about this workspace. Maxiumum length 6000 chars.")

    def performSetup(self):
        # self.fields['foo'].widget.attrs['class'] += ' mini-field'
        pass


class WorkSpaceLifeCyclesSubForm(Forms):
    wowo_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    start = forms.DateTimeField(required=False, widget=crud.DateTimeLocalInput(), help_text="Start date for life-cycles")
    end = forms.DateTimeField(required=False, widget=crud.DateTimeLocalInput(), help_text="End date for life-cycles")
    interval_length = forms.CharField(max_length=1000, help_text='Number of *units* each cycle lasts')
    interval_type = forms.ChoiceField(
        choices=[(item.name, item.value.replace('_', ' ').title()) for item in IntervalType],
        help_text="Unit of measurement"
    ) 
    life_cycle_type = forms.ChoiceField(
        choices=[(item.name, item.value.replace('_', ' ').title()) for item in LifeCycleType],
        help_text="Unit of measurement"
    )
    
    def performSetup(self):
        # self.fields['foo'].widget.attrs['class'] += ' mini-field'
        pass


class WorkSpaceUserSettingsSubForm(Forms):
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
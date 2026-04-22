from django.contrib.auth import get_user_model
from django import forms

from core.lib.FormsParent import Forms
from tasks.drm.mapper_values import *
from core.helpers import crud

class WorkSpaceEditForm(Forms):
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
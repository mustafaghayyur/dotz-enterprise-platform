from django.contrib.auth import get_user_model
from django import forms

from core.lib.FormsParent import Forms
from users.models import User, Department
from tasks.drm.mapper_values import WSType

class WorkSpaceEditForm(Forms):
    """
        Setup Task Edit Form.
    """ 
    wowo_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    
    name = forms.CharField(max_length=255)
    type = forms.ChoiceField(
        choices=[(item.value, item.name.replace('_', ' ').title()) for item in WSType],
        help_text="Choose type of WorkSpace"
    )
    
    description = forms.CharField(widget=forms.Textarea, empty_value="Maxiumum length 6000 chars")
    department_id = forms.ModelChoiceField(queryset=Department.objects.none(), required=False)
    lead_id = forms.ModelChoiceField(queryset=User.objects.none(), empty_label="Select Initial Team Lead")
    
    
    def performSetup(self):
        pass
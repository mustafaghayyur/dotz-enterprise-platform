from django.contrib.auth import get_user_model
from django import forms

from core.lib.FormsParent import Forms
from tasks.drm.mapper_values import WSType

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
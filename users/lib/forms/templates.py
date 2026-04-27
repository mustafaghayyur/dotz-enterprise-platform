from django import forms
from core.lib.FormsParent import Forms
from users.models import *
from core.helpers import crud


class UsersEditForm(Forms):
    usus_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    password = forms.CharField(max_length=128, required=False)
    last_login = forms.DateTimeField(required=False, widget=crud.DateTimeLocalInput())
    is_superuser = forms.BooleanField(required=False)
    username = forms.CharField(max_length=150, required=False)
    first_name = forms.CharField(max_length=150, required=False)
    last_name = forms.CharField(max_length=150, required=False)
    email = forms.EmailField(max_length=254, required=False)
    is_staff = forms.BooleanField(required=False)
    user_level = forms.IntegerField(required=False)
    is_active = forms.BooleanField(required=False)
    date_joined = forms.DateTimeField(required=False, widget=crud.DateTimeLocalInput())
    usus_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    usus_update_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    usus_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    uspr_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    legal_first_name = forms.CharField(max_length=150, required=False)
    legal_last_name = forms.CharField(max_length=150, required=False)
    office_phone = forms.CharField(max_length=15, required=False)
    office_ext = forms.CharField(max_length=10, required=False)
    cell_phone = forms.CharField(max_length=15, required=False)
    home_phone = forms.CharField(max_length=15, required=False)
    office_location = forms.CharField(max_length=250, required=False)
    uspr_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    uspr_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    uspr_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    usse_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    settings = forms.JSONField(required=False)
    usse_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    usse_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    usse_latest = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class UserReportsTosEditForm(Forms):
    usre_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    user_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    reportsTo_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    usre_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    usre_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    usre_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class UserEditLogsEditForm(Forms):
    uslo_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    user_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    change_log = forms.JSONField(required=False)
    uslo_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    uslo_update_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    uslo_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class DepartmentsEditForm(Forms):
    dede_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    name = forms.CharField(max_length=70, required=False)
    description = forms.CharField(max_length=1000, required=False)
    creator_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    parent_id = forms.ModelChoiceField(queryset=Department.objects.none(), required=False, empty_label="Select One", label="Parent Department")
    dede_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    dede_update_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    dede_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class DepartmentUsersEditForm(Forms):
    deus_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    user_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    department_id = forms.ModelChoiceField(queryset=Department.objects.none(), required=False)
    deus_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    deus_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    deus_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


class DepartmentHeadsEditForm(Forms):
    dehe_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    department_id = forms.ModelChoiceField(queryset=Department.objects.none(), required=False)
    head_id = forms.ModelChoiceField(queryset=User.objects.none(), required=False)
    dehe_latest = forms.CharField(widget=forms.HiddenInput(), required=False)
    dehe_create_time = forms.CharField(widget=forms.HiddenInput(), required=False)
    dehe_delete_time = forms.CharField(widget=forms.HiddenInput(), required=False)

#======================================


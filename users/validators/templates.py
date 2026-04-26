from rest_framework import serializers
from restapi.validators.generic import *


class Userso2oRecordSerializerTemplate(serializers.Serializer):
    usus_id = serializers.IntegerField(**intNullableOpts)
    password = serializers.CharField(max_length=128, **charNullableOpts)
    last_login = DateTimeFieldForJS(**datetimeNullableOpts)
    is_superuser = serializers.BooleanField(**booleanNullableOpts)
    username = serializers.CharField(max_length=150, **charNullableOpts)
    first_name = serializers.CharField(max_length=150, **charNullableOpts)
    last_name = serializers.CharField(max_length=150, **charNullableOpts)
    email = serializers.EmailField(max_length=254, **charNullableOpts)
    is_staff = serializers.BooleanField(**booleanNullableOpts)
    user_level = serializers.IntegerField(**intNullableOpts)
    is_active = serializers.BooleanField(**booleanNullableOpts)
    date_joined = DateTimeFieldForJS(**datetimeNullableOpts)
    usus_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    usus_update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    usus_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    uspr_id = serializers.IntegerField(**intNullableOpts)
    legal_first_name = serializers.CharField(max_length=150, **charNullableOpts)
    legal_last_name = serializers.CharField(max_length=150, **charNullableOpts)
    office_phone = serializers.CharField(max_length=15, **charNullableOpts)
    office_ext = serializers.CharField(max_length=10, **charNullableOpts)
    cell_phone = serializers.CharField(max_length=15, **charNullableOpts)
    home_phone = serializers.CharField(max_length=15, **charNullableOpts)
    office_location = serializers.CharField(max_length=250, **charNullableOpts)
    uspr_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    uspr_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    uspr_latest = serializers.ChoiceField(**latestChoiceOpts)
    usse_id = serializers.IntegerField(**intNullableOpts)
    settings = serializers.JSONField(**charNullableOpts)
    usse_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    usse_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    usse_latest = serializers.ChoiceField(**latestChoiceOpts)

#======================================


class UserReportsTosm2mRecordSerializerTemplate(serializers.Serializer):
    usre_id = serializers.IntegerField(**intNullableOpts)
    user_id = serializers.IntegerField(**intNullableOpts)
    reportsTo_id = serializers.IntegerField(**intNullableOpts)
    usre_latest = serializers.ChoiceField(**latestChoiceOpts)
    usre_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    usre_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

#======================================


class EditLogsrlcRecordSerializerTemplate(serializers.Serializer):
    uslo_id = serializers.IntegerField(**intNullableOpts)
    user_id = serializers.IntegerField(**intNullableOpts)
    change_log = serializers.JSONField(**charNullableOpts)
    uslo_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    uslo_update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    uslo_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

#======================================


class Departmentso2oRecordSerializerTemplate(serializers.Serializer):
    dede_id = serializers.IntegerField(**intNullableOpts)
    name = serializers.CharField(max_length=70, **charNullableOpts)
    description = serializers.CharField(max_length=1000, **charNullableOpts)
    creator_id = serializers.IntegerField(**intNullableOpts)
    parent_id = serializers.IntegerField(**intNullableOpts)
    dede_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    dede_update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    dede_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

#======================================


class DepartmentUsersm2mRecordSerializerTemplate(serializers.Serializer):
    deus_id = serializers.IntegerField(**intNullableOpts)
    user_id = serializers.IntegerField(**intNullableOpts)
    department_id = serializers.IntegerField(**intNullableOpts)
    deus_latest = serializers.ChoiceField(**latestChoiceOpts)
    deus_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    deus_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

#======================================


class DepartmentHeadsm2mRecordSerializerTemplate(serializers.Serializer):
    dehe_id = serializers.IntegerField(**intNullableOpts)
    department_id = serializers.IntegerField(**intNullableOpts)
    head_id = serializers.IntegerField(**intNullableOpts)
    dehe_latest = serializers.ChoiceField(**latestChoiceOpts)
    dehe_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    dehe_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

#======================================


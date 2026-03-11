from rest_framework.serializers import Serializer, IntegerField, ChoiceField, CharField, EmailField, BooleanField, JSONField

from users.drm.mapper_values import *
from core.helpers import validators
from restapi.validators.generic import *

class UserO2ORecordSerializerGeneric(Serializer):
    """
        Generic Serializer for O2O User records.
        All fields must be non-mandatory.
    """
    id = IntegerField(**intNullableOpts)  # id = usus_id; but different places require different terms.
    usus_id = IntegerField(**intNullableOpts)
    uspr_id = IntegerField(**intNullableOpts)
    
    username = CharField(allow_null=True, allow_blank=True, required=False, max_length=150)
    first_name = CharField(allow_null=True, allow_blank=True, required=False, max_length=150)
    last_name = CharField(allow_null=True, allow_blank=True, required=False, max_length=150)
    email = EmailField(allow_null=True, allow_blank=True, required=False)
    is_staff = BooleanField(required=False)
    is_active = BooleanField(required=False)
    user_level = IntegerField(**intNullableOpts)
    
    legal_first_name = CharField(allow_null=True, allow_blank=True, required=False, max_length=150)
    legal_last_name = CharField(allow_null=True, allow_blank=True, required=False, max_length=150)
    office_phone = CharField(allow_null=True, allow_blank=True, required=False, max_length=15)
    office_ext = CharField(allow_null=True, allow_blank=True, required=False, max_length=10)
    cell_phone = CharField(allow_null=True, allow_blank=True, required=False, max_length=15)
    home_phone = CharField(allow_null=True, allow_blank=True, required=False, max_length=15)
    office_location = CharField(allow_null=True, allow_blank=True, required=False, max_length=250)
    
    settings = JSONField(allow_null=True, required=False)

    uspr_latest = ChoiceField(**latestChoiceOpts)
    usse_latest = ChoiceField(**latestChoiceOpts)

    date_joined = DateTimeFieldForJS(**datetimeNullableOpts)
    usus_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    uspr_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    usse_create_time = DateTimeFieldForJS(**datetimeNullableOpts)

    usus_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    uspr_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    usse_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

    usus_update_time = DateTimeFieldForJS(**datetimeNullableOpts)

    

class UserO2ORecordSerializerLax(UserO2ORecordSerializerGeneric):
    pass


class UserO2ORecordSerializerStrict(UserO2ORecordSerializerLax):
    pass

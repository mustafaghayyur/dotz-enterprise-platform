from rest_framework.serializers import Serializer, IntegerField, ChoiceField, CharField

from tasks.drm.mapper_values import WSType, IntervalType, LifeCycleType
from core.helpers import validators
from restapi.validators.generic import *

class WorkSpaceO2ORecordSerializerGeneric(Serializer):
    """
        Generic Serializer for O2O WorkSpace records.
        All fields must be non-mandatory.
    """
    id = IntegerField(**intNullableOpts)  # id = wowo_id; but different places require different terms.
    wowo_id = IntegerField(**intNullableOpts)
    wopr_id = IntegerField(**intNullableOpts)

    name = CharField(allow_null=True, allow_blank=True, required=False, max_length=1000)
    type = ChoiceField(allow_null=True, allow_blank=True, required=False, choices=[(c.value, c.value) for c in WSType])

    description = CharField(allow_null=True, allow_blank=True, required=False, min_length=20, max_length=6000)
    
    # lifecycle = CharField(allow_null=True, allow_blank=True, required=False, max_length=255)
    start = DateTimeFieldForJS(**datetimeNullableOpts)
    end = DateTimeFieldForJS(**datetimeNullableOpts)
    interval_length = IntegerField(**intNullableOpts)
    interval_type = ChoiceField(allow_null=True, allow_blank=True, required=False, choices=[(c.value, c.value) for c in IntervalType])
    life_cycle_type = ChoiceField(allow_null=True, allow_blank=True, required=False, choices=[(c.value, c.value) for c in LifeCycleType])

    creator_id = IntegerField(**intNullableOpts)
    wopr_latest = ChoiceField(**latestChoiceOpts)
    
    wowo_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wopr_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wowo_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wopr_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wowo_update_time = DateTimeFieldForJS(**datetimeNullableOpts)


    

class WorkSpaceO2ORecordSerializerLax(WorkSpaceO2ORecordSerializerGeneric):
    pass


class WorkSpaceO2ORecordSerializerStrict(WorkSpaceO2ORecordSerializerLax):
    pass

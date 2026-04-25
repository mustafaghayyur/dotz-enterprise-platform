from rest_framework.serializers import Serializer, IntegerField, ChoiceField, CharField

from tasks.drm.mapper_values import *
from core.helpers import validators
from restapi.validators.generic import *

class TaskO2ORecordSerializerGeneric(Serializer):
    """
        Generic Serializer for O2O Task records.
        All fields must be non-mandatory.
    """
    id = IntegerField(**intNullableOpts)  # id = tata_id; but different places require different terms.
    tata_id = IntegerField(**intNullableOpts)
    tade_id = IntegerField(**intNullableOpts)
    tadl_id = IntegerField(**intNullableOpts)
    tast_id = IntegerField(**intNullableOpts)
    taas_id = IntegerField(**intNullableOpts)
    tavi_id = IntegerField(**intNullableOpts)
    tawo_id = IntegerField(**intNullableOpts)
    tate_id = IntegerField(**intNullableOpts)
    tapo_id = IntegerField(**intNullableOpts)

    description = CharField(allow_null=True, allow_blank=True, required=False, min_length=20, max_length=2000)
    details = CharField(allow_null=True, allow_blank=True, required=False, min_length=50)
    points = IntegerField(**intNullableOpts)
    
    status = ChoiceField(allow_null=True, allow_blank=True, required=False, choices=[(c.name, c.value) for c in Status])
    visibility = ChoiceField(allow_null=True, allow_blank=True, required=False, choices=[(c.value, c.value) for c in Visibility])

    deadline = DateTimeFieldForJS(allow_null=True, required=False, validators=[validators.isFutureDeadlineOrNone])

    creator_id = IntegerField(**intNullableOpts)
    parent_id = IntegerField(**intNullableOpts)
    assignor_id = IntegerField(**intNullableOpts)
    assignee_id = IntegerField(**intNullableOpts)
    workspace_id = IntegerField(**intNullableOpts)
    task_id = IntegerField(**intNullableOpts)

    tade_latest = ChoiceField(**latestChoiceOpts)
    tadl_latest = ChoiceField(**latestChoiceOpts)
    tast_latest = ChoiceField(**latestChoiceOpts)
    taas_latest = ChoiceField(**latestChoiceOpts)
    tavi_latest = ChoiceField(**latestChoiceOpts)
    tawo_latest = ChoiceField(**latestChoiceOpts)
    tate_latest = ChoiceField(**latestChoiceOpts)
    tapo_latest = ChoiceField(**latestChoiceOpts)

    tata_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tade_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tadl_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tast_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    taas_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tavi_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tawo_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tate_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tapo_create_time = DateTimeFieldForJS(**datetimeNullableOpts)

    tata_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tade_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tadl_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tast_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    taas_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tavi_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tawo_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tate_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tapo_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

    tata_update_time = DateTimeFieldForJS(**datetimeNullableOpts)

    """
    def validate(self, data):
    """
    """
                    #If `tid` is not provided, use the provided `id` value.

        if data.get('tid', None) is None and data.get('id', None) is not None:
            data['tid'] = data['id']

        if data.get('id', None) is None and data.get('tid', None) is not None:
            data['id'] = data['tid']

        return data

    def validate_tid(self, value):
        if value is None:
            return self.initial_data.get('id')
        return value

    def to_internal_value(self, data):
        if data.get('id', None) is None and data.get('tid', None) is not None:
            data = dict(data) # make a copy
            data['id'] = data['tid']
            return super().to_internal_value(data)
    """



class TaskO2ORecordSerializerLax(TaskO2ORecordSerializerGeneric):
    pass


class TaskO2ORecordSerializerStrict(TaskO2ORecordSerializerLax):
    pass

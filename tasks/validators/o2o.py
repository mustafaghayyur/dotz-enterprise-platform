from rest_framework.serializers import IntegerField, ChoiceField, CharField

from tasks.drm.mapper_values import *
from core.helpers import validators
from restapi.validators.generic import *
from tasks.validators.templates import *


class TasksO2ORecordSerializerGeneric(Taskso2oRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)  # id = tata_id; but different places require different terms.
    
    description = CharField(allow_null=True, allow_blank=True, required=False, min_length=20, max_length=2000)
    details = CharField(allow_null=True, allow_blank=True, required=False, min_length=50)
    status = ChoiceField(allow_null=True, allow_blank=True, required=False, choices=[(c.name, c.value) for c in Status])
    visibility = ChoiceField(allow_null=True, allow_blank=True, required=False, choices=[(c.value, c.value) for c in Visibility])
    deadline = DateTimeFieldForJS(allow_null=True, required=False, validators=[validators.isFutureDeadlineOrNone])



class TasksO2ORecordSerializerLax(TasksO2ORecordSerializerGeneric):
    pass


class TasksO2ORecordSerializerStrict(TasksO2ORecordSerializerLax):
    pass




# Workspaces

class WorkSpacesO2ORecordSerializerGeneric(WorkSpaceso2oRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)  # id = wowo_id; but different places require different terms.
    type = ChoiceField(allow_null=True, allow_blank=True, required=False, choices=[(c.value, c.value) for c in WSType])
    interval_type = ChoiceField(allow_null=True, allow_blank=True, required=False, choices=[(c.value, c.value) for c in IntervalType])
    life_cycle_type = ChoiceField(allow_null=True, allow_blank=True, required=False, choices=[(c.value, c.value) for c in LifeCycleType])    

class WorkSpacesO2ORecordSerializerLax(WorkSpacesO2ORecordSerializerGeneric):
    pass

class WorkSpacesO2ORecordSerializerStrict(WorkSpacesO2ORecordSerializerLax):
    pass

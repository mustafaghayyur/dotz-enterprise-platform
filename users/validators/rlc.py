from rest_framework.serializers import Serializer, IntegerField, CharField, JSONField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *
from .templates import *

# Users
class EditLogsSerializerGeneric(EditLogsrlcRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    change_log = JSONField(allow_null=True, required=False)

class EditLogsSerializerLax(EditLogsSerializerGeneric):
    pass

class EditLogsSerializerStrict(EditLogsSerializerLax):
    pass

# Departments


from rest_framework.serializers import Serializer, IntegerField, CharField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *

class WSTermSerializerGeneric(Serializer):
    """
        Generic serializer, all fields must be nullable
    """
    id = IntegerField(**intNullableOpts)
    wote_id = IntegerField(**intNullableOpts)
    workspace_id = IntegerField(**intNullableOpts)
    term = CharField(allow_null=True, allow_blank=True, required=False, min_length=50, max_length=200)
    term_description = CharField(allow_null=True, allow_blank=True, required=False, min_length=50, max_length=200)
    parent_id = IntegerField(**intNullableOpts)
    create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    delete_time = DateTimeFieldForJS(**datetimeNullableOpts)


class WSTermSerializerLax(WSTermSerializerGeneric):
    pass


class WSTermSerializerStrict(WSTermSerializerLax):
    pass

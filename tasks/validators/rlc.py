from rest_framework.serializers import Serializer, IntegerField, CharField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *

class CommentSerializerGeneric(Serializer):
    """
        Generic serializer, all fields must be nullable
    """
    id = IntegerField(**intNullableOpts)
    taco_id = IntegerField(**intNullableOpts)
    task_id = IntegerField(**intNullableOpts)
    comment = CharField(allow_null=True, allow_blank=True, required=False, min_length=50, max_length=6000)
    commenter_id = IntegerField(**intNullableOpts)
    parent_id = IntegerField(**intNullableOpts)
    create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    delete_time = DateTimeFieldForJS(**datetimeNullableOpts)


class CommentSerializerLax(CommentSerializerGeneric):
    pass


class CommentSerializerStrict(CommentSerializerLax):
    pass

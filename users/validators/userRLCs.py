from rest_framework.serializers import Serializer, IntegerField, CharField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *

class UserLogSerializerGeneric(Serializer):
    """
        Generic serializer, all fields must be nullable
    """
    id = IntegerField(**intNullableOpts)
    uslo_id = IntegerField(**intNullableOpts)
    user_id = IntegerField(**intNullableOpts)
    change_log = CharField(allow_null=True, allow_blank=True, required=False, min_length=50, max_length=6000)
    create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    delete_time = DateTimeFieldForJS(**datetimeNullableOpts)


class UserLogSerializerLax(UserLogSerializerGeneric):
    pass


class UserLogSerializerStrict(UserLogSerializerLax):
    pass


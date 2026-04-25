from rest_framework.serializers import Serializer, IntegerField, ChoiceField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *

class WatcherSerializerGeneric(Serializer):
    """
        Generic serializer, all fields must be nullable
    """
    id = IntegerField(**intNullableOpts)
    tawa_id = IntegerField(**intNullableOpts)
    task_id = IntegerField(**intNullableOpts)
    watcher_id = IntegerField(**intNullableOpts)
    latest = ChoiceField(**latestChoiceOpts)
    create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    delete_time = DateTimeFieldForJS(**datetimeNullableOpts)


class WatcherSerializerLax(WatcherSerializerGeneric):
    pass


class WatcherSerializerStrict(WatcherSerializerLax):
    pass

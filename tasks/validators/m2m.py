from rest_framework.serializers import Serializer, IntegerField, ChoiceField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *
from tasks.validators.templates import *


class WatchersM2MRecordSerializerGeneric(Watchersm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)

class WatchersM2MRecordSerializerLax(WatchersM2MRecordSerializerGeneric):
    pass

class WatchersM2MRecordSerializerStrict(WatchersM2MRecordSerializerLax):
    pass


# Workspaces

class WorkSpaceDepartmentsM2MRecordSerializerGeneric(WorkSpaceDepartmentsm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    
class WorkSpaceDepartmentsM2MRecordSerializerLax(WorkSpaceDepartmentsM2MRecordSerializerGeneric):
    pass
class WorkSpaceDepartmentsM2MRecordSerializerStrict(WorkSpaceDepartmentsM2MRecordSerializerLax):
    pass


class WorkSpaceUsersM2MRecordSerializerGeneric(WorkSpaceUsersm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    
class WorkSpaceUsersM2MRecordSerializerLax(WorkSpaceUsersM2MRecordSerializerGeneric):
    pass
class WorkSpaceUsersM2MRecordSerializerStrict(WorkSpaceUsersM2MRecordSerializerLax):
    pass
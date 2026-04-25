from rest_framework.serializers import Serializer, IntegerField, ChoiceField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *
from tasks.validators.templates import *


class WatchersM2MSerializerGeneric(Watchersm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)

class WatchersM2MSerializerLax(WatchersM2MSerializerGeneric):
    pass

class WatchersM2MSerializerStrict(WatchersM2MSerializerLax):
    pass


# Workspaces

class WorkSpaceDepartmentsM2MSerializerGeneric(WorkSpaceDepartmentsm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    
class WorkSpaceDepartmentsM2MSerializerLax(WorkSpaceDepartmentsM2MSerializerGeneric):
    pass
class WorkSpaceDepartmentsM2MSerializerStrict(WorkSpaceDepartmentsM2MSerializerLax):
    pass


class WorkSpaceUsersM2MSerializerGeneric(WorkSpaceUsersm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    
class WorkSpaceUsersM2MSerializerLax(WorkSpaceUsersM2MSerializerGeneric):
    pass
class WorkSpaceUsersM2MSerializerStrict(WorkSpaceUsersM2MSerializerLax):
    pass
from rest_framework.serializers import Serializer, IntegerField, ChoiceField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *
from tasks.validators.templates import *


class TaskWatchersM2MRecordSerializerGeneric(TaskWatchersm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)

class TaskWatchersM2MRecordSerializerLax(TaskWatchersM2MRecordSerializerGeneric):
    pass

class TaskWatchersM2MRecordSerializerStrict(TaskWatchersM2MRecordSerializerLax):
    pass



class UserPointsForTasksM2MRecordSerializerGeneric(UserPointsForTasksm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)

class UserPointsForTasksM2MRecordSerializerLax(UserPointsForTasksM2MRecordSerializerGeneric):
    pass

class UserPointsForTasksM2MRecordSerializerStrict(UserPointsForTasksM2MRecordSerializerLax):
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
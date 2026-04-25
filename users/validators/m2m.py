from rest_framework.serializers import Serializer, IntegerField, ChoiceField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *
from .templates import *

# Users

class UserReportsTosM2MSerializerGeneric(UserReportsTosm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    
class UserReportsTosM2MSerializerLax(UserReportsTosM2MSerializerGeneric):
    pass
class UserReportsTosM2MSerializerStrict(UserReportsTosM2MSerializerLax):
    pass



# Departments

class DepartmentHeadsM2MSerializerGeneric(DepartmentHeadsm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    
class DepartmentHeadsM2MSerializerLax(DepartmentHeadsM2MSerializerGeneric):
    pass
class DepartmentHeadsM2MSerializerStrict(DepartmentHeadsM2MSerializerLax):
    pass



class DepartmentUsersM2MSerializerGeneric(DepartmentUsersm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    
class DepartmentUsersM2MSerializerLax(DepartmentUsersM2MSerializerGeneric):
    pass
class DepartmentUsersM2MSerializerStrict(DepartmentUsersM2MSerializerLax):
    pass


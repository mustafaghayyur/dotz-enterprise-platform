from rest_framework.serializers import Serializer, IntegerField, ChoiceField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *
from .templates import *

# Users

class UserReportsTosSerializerGeneric(UserReportsTosm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    
class UserReportsTosSerializerLax(UserReportsTosSerializerGeneric):
    pass
class UserReportsTosSerializerStrict(UserReportsTosSerializerLax):
    pass



# Departments

class DeptHeadsSerializerGeneric(DepartmentHeadsm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    
class DeptHeadsSerializerLax(DeptHeadsSerializerGeneric):
    pass
class DeptHeadsSerializerStrict(DeptHeadsSerializerLax):
    pass



class DeptUserSerializerGeneric(DepartmentUsersm2mRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    
class DeptUserSerializerLax(DeptUserSerializerGeneric):
    pass
class DeptUserSerializerStrict(DeptUserSerializerLax):
    pass


from rest_framework.serializers import Serializer, IntegerField, ChoiceField, CharField, EmailField, BooleanField, JSONField

from users.drm.mapper_values import *
from core.helpers import validators
from restapi.validators.generic import *
from .templates import *

# Users

class UsersO2ORecordSerializerGeneric(Userso2oRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)  # id = usus_id; but different places require different terms.
    settings = JSONField(allow_null=True, required=False)
    
class UsersO2ORecordSerializerLax(UsersO2ORecordSerializerGeneric):
    pass

class UsersO2ORecordSerializerStrict(UsersO2ORecordSerializerLax):
    pass



# Departments

class DepartmentsO2ORecordSerializerGeneric(Departmentso2oRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)  # id = dede_id; but different places require different terms.
    
class DepartmentsO2ORecordSerializerLax(DepartmentsO2ORecordSerializerGeneric):
    pass

class DepartmentsO2ORecordSerializerStrict(DepartmentsO2ORecordSerializerLax):
    pass

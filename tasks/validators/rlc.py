from rest_framework.serializers import IntegerField, CharField

from tasks.drm.mapper_values import *
from restapi.validators.generic import *
from tasks.validators.templates import *


class CommentsRLCSerializerGeneric(CommentsrlcRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    taco_id = IntegerField(**intNullableOpts)
    task_id = IntegerField(**intNullableOpts)
    comment = CharField(allow_null=True, allow_blank=True, required=False, min_length=50, max_length=6000)
    commenter_id = IntegerField(**intNullableOpts)
    parent_id = IntegerField(**intNullableOpts)
    create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    delete_time = DateTimeFieldForJS(**datetimeNullableOpts)


class CommentsRLCSerializerLax(CommentsRLCSerializerGeneric):
    pass


class CommentsRLCSerializerStrict(CommentsRLCSerializerLax):
    pass


# Workspaces

class WorkSpaceTermsRLCSerializerGeneric(WorkSpaceTermsrlcRecordSerializerTemplate):
    id = IntegerField(**intNullableOpts)
    term = CharField(allow_null=True, allow_blank=True, required=False, min_length=50, max_length=200)
    term_description = CharField(allow_null=True, allow_blank=True, required=False, min_length=50, max_length=2000)
    

class WorkSpaceTermsRLCSerializerLax(WorkSpaceTermsRLCSerializerGeneric):
    pass


class WorkSpaceTermsRLCSerializerStrict(WorkSpaceTermsRLCSerializerLax):
    pass

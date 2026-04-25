from rest_framework import serializers
from restapi.validators.generic import *


class WorkSpacesso2oRecordSerializerTemplate(serializers.Serializer):
    wowo_id = serializers.CharField(**charNullableOpts)
    name = serializers.CharField(max_length=1000, **charNullableOpts)
    wowo_description = serializers.CharField(max_length=6000, **charNullableOpts)
    type = serializers.CharField(max_length=30, **charNullableOpts)
    creator_id = serializers.IntegerField(**intNullableOpts)
    wowo_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wowo_update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wowo_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

#======================================


class WorkSpaceDepartmentsm2mRecordSerializerTemplate(serializers.Serializer):
    wode_id = serializers.CharField(**charNullableOpts)
    department_id = serializers.IntegerField(**intNullableOpts)
    workspace_id = serializers.IntegerField(**intNullableOpts)
    wode_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wode_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wode_latest = serializers.CharField(**latestChoiceOpts)

#======================================


class WorkSpaceUsersm2mRecordSerializerTemplate(serializers.Serializer):
    wous_id = serializers.CharField(**charNullableOpts)
    user_id = serializers.IntegerField(**intNullableOpts)
    workspace_id = serializers.IntegerField(**intNullableOpts)
    wous_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wous_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wous_latest = serializers.CharField(**latestChoiceOpts)

#======================================


class WorkSpaceTermsrlcRecordSerializerTemplate(serializers.Serializer):
    wote_id = serializers.CharField(**charNullableOpts)
    workspace_id = serializers.IntegerField(**intNullableOpts)
    parent_id = serializers.IntegerField(**intNullableOpts)
    term = serializers.CharField(max_length=200, **charNullableOpts)
    term_description = serializers.CharField(max_length=2000, **charNullableOpts)
    wote_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wote_update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wote_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

#======================================


class Tasksso2oRecordSerializerTemplate(serializers.Serializer):
    wolc_id = serializers.CharField(**charNullableOpts)
    start = DateTimeFieldForJS(**datetimeNullableOpts)
    end = DateTimeFieldForJS(**datetimeNullableOpts)
    interval_length = serializers.IntegerField(**intNullableOpts)
    interval_type = serializers.CharField(max_length=50, **charNullableOpts)
    life_cycle_type = serializers.CharField(max_length=50, **charNullableOpts)
    workspace_id = serializers.IntegerField(**intNullableOpts)
    wolc_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wolc_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    wolc_latest = serializers.CharField(**latestChoiceOpts)
    tata_id = serializers.CharField(**charNullableOpts)
    description = serializers.CharField(max_length=2000, **charNullableOpts)
    creator_id = serializers.IntegerField(**intNullableOpts)
    parent_id = serializers.IntegerField(**intNullableOpts)
    tata_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tata_update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tata_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tade_id = serializers.CharField(**charNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    details = serializers.CharField(**charNullableOpts)
    tade_latest = serializers.CharField(**latestChoiceOpts)
    tade_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tade_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tadl_id = serializers.CharField(**charNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    deadline = DateTimeFieldForJS(**datetimeNullableOpts)
    tadl_latest = serializers.CharField(**latestChoiceOpts)
    tadl_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tadl_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tast_id = serializers.CharField(**charNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    status = serializers.CharField(max_length=20, **charNullableOpts)
    tast_latest = serializers.CharField(**latestChoiceOpts)
    tast_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tast_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tavi_id = serializers.CharField(**charNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    visibility = serializers.CharField(max_length=20, **charNullableOpts)
    tavi_latest = serializers.CharField(**latestChoiceOpts)
    tavi_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tavi_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    taas_id = serializers.CharField(**charNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    assignor_id = serializers.IntegerField(**intNullableOpts)
    assignee_id = serializers.IntegerField(**intNullableOpts)
    taas_latest = serializers.CharField(**latestChoiceOpts)
    taas_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    taas_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tawo_id = serializers.CharField(**charNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    workspace_id = serializers.IntegerField(**intNullableOpts)
    tawo_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tawo_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tawo_latest = serializers.CharField(**latestChoiceOpts)
    tate_id = serializers.CharField(**charNullableOpts)
    term_id = serializers.IntegerField(**intNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    tate_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tate_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tate_latest = serializers.CharField(**latestChoiceOpts)
    tapo_id = serializers.CharField(**charNullableOpts)
    points = serializers.IntegerField(**intNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    tapo_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tapo_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tapo_latest = serializers.CharField(**latestChoiceOpts)

#======================================


class Watchersm2mRecordSerializerTemplate(serializers.Serializer):
    tawa_id = serializers.CharField(**charNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    watcher_id = serializers.IntegerField(**intNullableOpts)
    tawa_latest = serializers.CharField(**latestChoiceOpts)
    tawa_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    tawa_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

#======================================


class UserPointsForTasksm2mRecordSerializerTemplate(serializers.Serializer):
    taup_id = serializers.CharField(**charNullableOpts)
    rating = serializers.IntegerField(**intNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    contributor_id = serializers.IntegerField(**intNullableOpts)
    taup_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    taup_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)
    taup_latest = serializers.CharField(**latestChoiceOpts)

#======================================


class CommentsrlcRecordSerializerTemplate(serializers.Serializer):
    taco_id = serializers.CharField(**charNullableOpts)
    task_id = serializers.IntegerField(**intNullableOpts)
    comment = serializers.CharField(max_length=6000, **charNullableOpts)
    response_to_id = serializers.IntegerField(**intNullableOpts)
    commenter_id = serializers.IntegerField(**intNullableOpts)
    taco_create_time = DateTimeFieldForJS(**datetimeNullableOpts)
    taco_update_time = DateTimeFieldForJS(**datetimeNullableOpts)
    taco_delete_time = DateTimeFieldForJS(**datetimeNullableOpts)

#======================================


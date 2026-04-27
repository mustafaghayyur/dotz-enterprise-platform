from django.db import models
from django.conf import settings as sysconf

from ..drm.querysets import *
from users.models import User, Department


### WorkSpace Models ###

class WorkSpace(models.Model):
    """
        O2O Model. #wowo#
    """
    name = models.CharField(max_length=1000)
    description = models.CharField(max_length=6000)
    type = models.CharField(max_length=30)  # enum of ['private' | 'open']
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = WorkSpaceQuerySet.as_manager()


class ProjectLifeCycle(models.Model):
    """
        O2O Model. #wolc#
    """
    start = models.DateTimeField()
    end = models.DateTimeField()
    interval_length = models.IntegerField(null=False, blank=False)
    interval_type = models.CharField(null=False, blank=False, max_length=50)  # enum of [day | week | month | year]
    life_cycle_type = models.CharField(null=False, blank=False, max_length=50)  # enum of [reset | continuance]
    workspace = models.ForeignKey(WorkSpace, on_delete=models.CASCADE)
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]

    objects = WorkSpaceCTQuerySet.as_manager()


class WorkSpaceDepartment(models.Model):
    """
        M2M Model. #wode#
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    workspace = models.ForeignKey(WorkSpace, on_delete=models.CASCADE)
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]

    objects = WorkSpaceM2MQuerySet.as_manager()


class WorkSpaceUser(models.Model):
    """
        M2M Model. #wous#
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    workspace = models.ForeignKey(WorkSpace, on_delete=models.CASCADE)
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]

    objects = WorkSpaceM2MQuerySet.as_manager()


class WorkSpaceTerm(models.Model):
    """
        RLC Model. #wote#
    """
    workspace = models.ForeignKey(WorkSpace, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    term = models.CharField(max_length=200)
    term_description = models.CharField(max_length=2000)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = WorkSpaceRLCQuerySet.as_manager()
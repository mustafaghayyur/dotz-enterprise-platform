from django.db import models

from users.models.user import User
from users.drm.querysets import *


#### Department Mapper Models ####

class Department(models.Model):
    """
        Departments, can be nested.
        Master table for Department Mapper.
        O2O Model. #dede#
    """
    name = models.CharField(max_length=70)
    description = models.CharField(max_length=1000)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = DepartmentQuerySet.as_manager()


class DepartmentUser(models.Model):
    """
        User's association with departments.
        M2M Model. #deus#
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = DepartmentM2MQuerySet.as_manager()


class DepartmentHead(models.Model):
    """
        Assigns head(s) to departments.
        M2M Model. #dehe#
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    head = models.ForeignKey(User, on_delete=models.CASCADE)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = DepartmentM2MQuerySet.as_manager()
    
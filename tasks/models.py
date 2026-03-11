from django.db import models
from django.conf import settings as sysconf

from .drm.querysets import * 
from users.models import User, Department


### Tasks Mapper Models ###

class Task(models.Model):
    """
        O2O Model.
    """
    description = models.CharField(max_length=2000)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = TaskQuerySet.as_manager()


class Details(models.Model):
    """
        O2O Model.
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    details = models.TextField()  # @todo: look into > difflib SequenceMatcher.quick_ratio()
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = TaskCTQuerySet.as_manager()


class Deadline(models.Model):
    """
        O2O Model.
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    deadline = models.DateTimeField()
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = TaskCTQuerySet.as_manager()


class Status(models.Model):
    """
        O2O Model.
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    status = models.CharField(max_length=20) 
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = TaskCTQuerySet.as_manager()


class Visibility(models.Model):
    """
        O2O Model.
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    visibility = models.CharField(max_length=20)
    latest = models.SmallIntegerField(default=1, db_default=1)
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = TaskCTQuerySet.as_manager()


class Assignment(models.Model):
    """
        O2O Model.
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    assignor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='asasignor_user')
    assignee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='asasignee_user')
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = TaskCTQuerySet.as_manager()


class Watcher(models.Model):
    """
        M2M Model.
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    watcher = models.ForeignKey(User, on_delete=models.CASCADE)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = TaskM2MQuerySet.as_manager()


class Comment(models.Model):
    """
        RLC Model.
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    comment = models.CharField(max_length=6000)
    response_to = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='parent_comment')
    commenter = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = TaskRLCQuerySet.as_manager()



### WorkSpace Models ###


class WorkSpace(models.Model):
    """
        O2O Model.
    """
    name = models.CharField(max_length=1000)
    description = models.CharField(max_length=6000)
    type = models.CharField(max_length=30)  # enum of ['private' | 'open']
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = WorkSpaceQuerySet.as_manager()


class TaskWorkSpace(models.Model):
    """
        Tasks Mapper model. Placed here to reference WorkSpace model FK
        O2O Model.
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    workspace = models.ForeignKey(WorkSpace, on_delete=models.CASCADE)
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]

    objects = TaskCTQuerySet.as_manager()


class WorkSpaceDepartment(models.Model):
    """
        M2M Model.
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    workspace = models.ForeignKey(WorkSpace, on_delete=models.CASCADE)
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]

    objects = WorkSpaceM2MQuerySet.as_manager()


class WorkSpaceUser(models.Model):
    """
        M2M Model.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    workspace = models.ForeignKey(WorkSpace, on_delete=models.CASCADE)
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]

    objects = WorkSpaceM2MQuerySet.as_manager()



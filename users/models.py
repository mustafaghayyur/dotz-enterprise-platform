from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.utils import timezone
from django.contrib.auth.models import UserManager, PermissionsMixin

from .drm.querysets import *

#### User Mapper Models ####

class DrmUserManager(UserManager.from_queryset(UserQuerySet)):
    # shell User Manager to enable our DRM UserQuerySet()
    pass

class User(AbstractBaseUser, PermissionsMixin):
    """
        We will do our best not to modify columns already set in Django. Only column additions.
        Master table for Users mapper. O2O model.
    """
    username_validator = UnicodeUsernameValidator()
    username = models.CharField(
        _("username"),
        max_length=150,
        unique=True,
        help_text=_(
            "Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only."
        ),
        validators=[username_validator],
        error_messages={
            "unique": _("A user with that username already exists."),
        },
    )
    first_name = models.CharField(_("preferred first name"), max_length=150, blank=True)
    last_name = models.CharField(_("preferred last name"), max_length=150, blank=True)
    email = models.EmailField(_("email address"), blank=True)
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can be a Staff Member."),
    )
    user_level = models.SmallIntegerField(
        _("access level of user"),
        default=1, 
        db_default=1  # 1 = memeber -> 9 = most senior administrator
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    delete_time = models.DateTimeField(null=True, blank=True)
    EMAIL_FIELD = "email"
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    objects = DrmUserManager()

    class Meta:
        db_table = 'auth_user'
        verbose_name = _("user")
        verbose_name_plural = _("users")

class UserProfile(models.Model):
    """
        Extension of the User model, meant for the user profile sections.
        O2O Model.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    legal_first_name = models.CharField(max_length=150, blank=True, null=True)
    legal_last_name = models.CharField(max_length=150, blank=True, null=True)
    office_phone = models.CharField(max_length=15, blank=True, null=True)
    office_ext = models.CharField(max_length=10, blank=True, null=True)
    cell_phone = models.CharField(max_length=15, blank=True, null=True)
    home_phone = models.CharField(max_length=15, blank=True, null=True)
    office_location = models.CharField(max_length=250, blank=True, null=True)
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]

    objects = UserCTQuerySet.as_manager()

    def __str__(self):
        return f'{self.legal_first_name} {self.legal_last_name} [{self.user.username}]'

class UserSettings(models.Model):
    """
        O2O Model
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    settings = models.JSONField(null=True, blank=True)
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]

    objects = UserRLCQuerySet.as_manager()


class UserReportsTo(models.Model):
    """
        User's boss(es). 
        M2M Model.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user')
    reportsTo = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_to')
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = UserM2MQuerySet.as_manager()


class EditLog(models.Model):
    """
        RLC Model
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    change_log = models.JSONField(null=False, blank=False)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = UserRLCQuerySet.as_manager()



#### Department Mapper Models ####

class Department(models.Model):
    """
        Departments, can be nested. 
        Master table for Department Mapper.
        O2O Model
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
        User's associent with departments. 
        M2M Model.
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
        M2M Model.
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    head = models.ForeignKey(User, on_delete=models.CASCADE)
    latest = models.SmallIntegerField(default=1, db_default=1)  # enum of [1 | 2]
    create_time = models.DateTimeField(auto_now_add=True)
    delete_time = models.DateTimeField(null=True, blank=True)

    objects = DepartmentM2MQuerySet.as_manager()
    
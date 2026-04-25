from rest_framework.serializers import Serializer, IntegerField, ChoiceField, CharField

from tasks.drm.mapper_values import WSType, IntervalType, LifeCycleType
from core.helpers import validators
from restapi.validators.generic import *


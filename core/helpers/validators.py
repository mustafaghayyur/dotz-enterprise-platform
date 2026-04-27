from django.utils import timezone
from rest_framework.exceptions import ValidationError

"""
    These are helper functions strictly used in DRF Serializers by our RestAPI.
"""

def isFutureDeadlineOrNone(value):
    return isFutureDatetime(value, 'Deadline', True)

def isFutureDeadlineAlways(value):
    return isFutureDatetime(value, 'Deadline', False)

def isPastDatetimeOrNone(value):
    return isPastDatetime(value, 'TimeStamp', True)

def isPastDatetimeAlways(value):
    return isPastDatetime(value, 'TimeStamp', False)

def isPositiveIdOrNone(value):
    return isPositiveInt(value, 'ID', True)

def isPositiveIdAlways(value):
    return isPositiveInt(value, 'ID', False)

def isLatestChoicetOrNone(value):
    return isLatestChoice(value, 'Latest', True)
    
def isLatestChoice(value, key, noneAllowed):
    if value is None:
        return isNoneAllowed(noneAllowed, key)
    
    if value not in [member.value for member in Latest]:
        raise ValidationError(f"{key} must be None or accepted Enum Value.")


def isFutureDatetime(dt, key, noneAllowed):
    """
        Validator to check if the datetime is in the future relative to Django's timezone.now().
    """
    if dt is None:
        return isNoneAllowed(noneAllowed, key)
    
    now = timezone.now()

    if dt.tzinfo is None:
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
        
    if dt <= now:
        raise ValidationError(f"{key} must be in the future.")
    
    return dt

def isPastDatetime(dt, key, noneAllowed):
    """
        Validator to check if the datetime is in the future relative to Django's timezone.now().
    """
    if dt is None:
        return isNoneAllowed(noneAllowed, key)
    
    now = timezone.now()

    if dt.tzinfo is None:
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
        
    if dt > now:
        raise ValidationError(f"{key} must not be in the past.")
    
    return dt

def isPositiveInt(value, key, noneAllowed):
    if value is None:
        return isNoneAllowed(noneAllowed, key)
    if not isinstance(value, int) or value <= 0:
        raise ValidationError(f"{key} must be None or an integer greater than 0.")


def isNoneAllowed(noneAllowed, key):
    """
        Helper function.
    """
    if noneAllowed:
        return None
    else:
        raise ValidationError(f"{key} cannot be None.")
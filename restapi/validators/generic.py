from rest_framework import serializers
from core.DRMcore.mappers.ValuesMapper import *
from core.helpers import validators

"""
    Holds generic helper function & classes used throughout validation process.
"""


class ParentSerializerClass(serializers.Serializer):
    """
    A Serializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """
    def __init__(self, *args, **kwargs):
        # 1. Pull out the 'fields' list from kwargs so super() doesn't error
        fields = kwargs.pop('fields', None)

        # 2. Instantiate the superclass normally
        super(ParentSerializerClass, self).__init__(*args, **kwargs)

        if fields is not None:
            # 3. Identify fields to drop: anything not in our 'fields' list
            allowed = set(fields)
            existing = set(self.fields.keys())
            for fieldName in existing - allowed:
                self.fields.pop(fieldName)



# Repeating options saved to dictionaries for convinient reuse...
intNullableOpts = {
    'allow_null': True, 
    'required': False,
    'validators': [validators.isPositiveIdOrNone]
}

charNullableOpts = {
    'allow_null': True, 
    'allow_blank': True, 
    'required': False,
}

booleanNullableOpts = {
    'required': False
}

intMandatoryOpts = {
    'allow_null': False,
    'required': True, 
    'validators': [validators.isPositiveIdAlways]
}

datetimeNullableOpts = {
    'allow_null': True, 
    'required': False, 
    'validators': [validators.isPastDatetimeOrNone]
}

latestChoiceOpts = {
    'choices': [(c.value, c.value) for c in Latest], 
    'allow_null': True,
    'required': False,
    'allow_blank': True,
    'validators': [validators.isLatestChoicetOrNone]
}

class DateTimeFieldForJS(serializers.DateTimeField):
    def to_representation(self, value):
        # Example format: '2025-01-03T01:55:00Z' (simplified format, often preferred)
        return value.strftime('%Y-%m-%dT%H:%M:%SZ')
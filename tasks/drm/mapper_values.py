from enum import Enum
from core.DRMcore.mappers.ValuesMapper import ValuesMapperGeneric

class TasksValuesMapper(ValuesMapperGeneric):
    """
        This class will help manage value expectations for certain enum fields.
        Enums will be managed in the application layer.
    """

    def status(self, key = 'all'):
        values = {itm.name: itm.value for itm in Status}

        if key is not None and key in values:
            return values[key]

        return values

    def visibility(self, key = 'all'):
        values = {itm.name: itm.value for itm in Visibility}

        if key is not None and key in values:
            return values[key]

        return values

"""
    Inheriting from 'str' ensures the values are strings, 
    making serialization to JSON straightforward.
"""
class Status(str, Enum):
    created = 'created'
    assigned = 'assigned'
    started = 'started'
    awaitingfeedback = 'awaiting_feedback'
    completed = 'completed'
    abandoned = 'abandoned'
    onhold = 'onhold'
    failed = 'failed'

class Visibility(str, Enum):
    private = 'private'
    workspaces = 'workspaces'
    # assigned = 'assigned' # @todo: future feature implementation
    # stakeholders = 'stakeholders' # @todo: future feature implementation





class WorkSpacesValuesMapper(ValuesMapperGeneric):
    """
        This class will help manage value expectations for certain enum fields.
        Enums will be managed in the application layer.
    """

    def type(self, key = 'all'):
        values = {itm.name: itm.value for itm in WSType}

        if key is not None and key in values:
            return values[key]

        return values

class WSType(str, Enum):
    """
        WorkSpaces Types Enum
    """
    private = 'private'
    open = 'open'
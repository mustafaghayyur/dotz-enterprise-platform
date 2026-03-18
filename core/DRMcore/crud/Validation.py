from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from core.helpers import crud, strings

class Validate:
    """
        Static class
        Can hold functions for validating items in Crud operations
    """

    @staticmethod
    def dictValidation(space, operation, dictionary):
        """
            Validates a dictionary passed to CRUD class.
        
            :param space: [string] App this crud is belongs to.
            :param operation: [string] CRUD operation
            :param dictionary: [dict] of submitted data to process
        """
        if not isinstance(dictionary, dict):
            raise Exception(f'Error 2002: Invalid input provided to {space}.CRUD.{operation}(). Expecting Dictionary.')
    
        if len(dictionary) < 1:
            raise Exception(f'Error 2003: Provided dictionary length zero in: {space}.CRUD.{operation}().')

    @staticmethod
    def mtIdValidation(mapper, space, operation, dictionary):
        """
            Ensures master-record-id is present in submitted-dictionary.
        """
        keys = ['id', mapper.master('abbreviation') + '_' + mapper.column('id'), mapper.master('foreignKeyName')]
        id = None

        for key in keys:
            if key not in dictionary:
                dictionary[key] = None
        
        for key in keys:
            if dictionary[key] is not None:
                id = dictionary[key]
        
        if id is None or not crud.isValidId({'id': id}, 'id'):
            raise Exception(f'Error 2001: Could not complete operation; master-record-id is not valid or missing. In {space}.CRUD.{operation}()')
        
        for key in keys:
            dictionary[key] = id
        
        return dictionary
    

    @staticmethod
    def generateIdColumnsForRelationType(mapper, relationType):
        """
            Returns [list] of id-column names with tbl prefix prepended to each.
            You can fetch 'o2o', 'm2m' or 'rlc' columns with this. Defaults to 'o2o'
            
            :param mapper: Mapper() instance
            :param relationType: [str] choose enum from 'o2o', 'm2m', 'rlc'
        """
        abbrvs = mapper.tableTypes(relationType)
        ids = []

        for abbrv in abbrvs:
            ids.append(abbrv + '_id')
        return ids


    @staticmethod
    def fillCurrentUserIdFields(state, mapper, submission):
        cuFields = mapper.currentUserFields()
        commonFields = mapper.commonFields()
        tables = mapper.tables()
        user = state.get('current_user')
        tbl = state.get('tbl')

        if user is None:
            raise Exception('Error 2004: Current User info is None. Cannot proceed.')

        if not isinstance(user, get_user_model()) or isinstance(user, AnonymousUser):
            raise Exception('Error 2005: Current User object not User model instance.')
        
        for field in cuFields:
            field = mapper.prefixedFields(field, 'field')
            key = field

            if field in commonFields:
                key = f'{tbl}_{field}'

            submission[key] = user.id

        return submission

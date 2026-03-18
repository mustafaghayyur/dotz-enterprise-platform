from core.DRMcore.mappers.RelationshipMappers import RelationshipMappers
from .mapper_values import UsersValuesMapper

class UsersMapper(RelationshipMappers):
    """
        All calls should be made to following method names without the '_' prefix.
        RelationshipMappers() has proper wrapper functions.
    """
    def startUpCode(self):
        """
            Used to insert operations in __init__()
        """
        # tables belonging to this mapper
        tables = ['usus', 'uspr', 'usre', 'usse', 'uslo']
        self.state.set('mapperTables', tables)
        
        self.setValuesMapper(UsersValuesMapper)

    def _master(self):
        return {
            'table': 'auth_user',
            'abbreviation': 'usus',
            'foreignKeyName': 'user_id',
        }

    def _commonFields(self):
        """
            These keys tend to be found in every table and cause problems 
            if not handled separately. Master().foreignKeyName is not included.
        """
        return ['id', 'create_time', 'update_time', 'delete_time', 'latest']

    def _ignoreOnUpdates(self):
        """
            Carries any fields within a table to ignore in CRUD.update() operations.
        """
        return {
            'usus': ['id', 'date_joined', 'create_time'],
            'uspr': ['id', 'latest', 'create_time', 'user_id'],
            'usse': ['id', 'latest', 'create_time', 'user_id'],
            'usre': ['id', 'latest', 'create_time', 'user_id'],
            'uslo': ['id', 'user_id', 'create_time', 'user_id'],
        }
    
    def _ignoreOnCreate(self):
        """
            Sets fields we can ignore in crud.create() proceses.
            Master().foreignKeyName is NOT included.
        """
        return {
            'usus': ['delete_time', 'create_time', 'update_time', 'id'],
            'uspr': ['delete_time', 'create_time', 'latest', 'id'],
            'usse': ['delete_time', 'create_time', 'latest', 'id'],
            'usre': ['delete_time', 'create_time', 'latest', 'id'],
            'uslo': ['delete_time', 'create_time', 'update_time', 'id'],
        }
    
    def _m2mFields(self):
        """
            Retrieves relational fields for specific M2M table.
        """
        return {
            'usre': {
                'firstCol': 'reporter_id',
                'secondCol': 'reportsTo_id',
                'tables': ['usus']
            },
        }
    
    def _dateFields(self):
        """
            Add all columns found in this mapper, that are date fields.
        """
        return ['create_time', 'update_time', 'delete_time', 'date_joined']

    def _serializers(self):
        """
            returns serializers relevent to mapper
        """
        return {
            'default': {
                'path': 'users.validators.users',
                'generic': 'UserO2ORecordSerializerGeneric',
                'lax': 'UserO2ORecordSerializerLax',
                'strict': 'UserO2ORecordSerializerStrict',
            },
            'usre': {
                'path': 'users.validators.usersM2Ms',
                'generic': 'UserReportingSerializerGeneric',
                'lax': 'UserReportingSerializerLax',
                'strict': 'UserReportingSerializerStrict',
            },
            'uslo': {
                'path': 'users.validators.usersRLCs',
                'generic': 'UserLogSerializerGeneric',
                'lax': 'UserLogSerializerLax',
                'strict': 'UserLogSerializerStrict',
            },
        }
    
    def _crudClasses(self):
        """
            returns CRUD classes relevent to mapper
        """
        return {
            'default': {
                'path': 'users.drm.crud',
                'name': 'Users',
            },
            'usre': {
                'path': 'users.drm.crud',
                'name': 'ReportsTo',
            },
            'uslo': {
                'path': 'users.drm.crud',
                'name': 'UserLog',
            },
        }
    
    def _currentUserFieldsCrud(self):
        """
            Returns list of fields which hold current user's id.
            Should allow limiting of external entries in these fields in CRUD operations.
        """
        return ['usre_user_id', 'uspr_user_id', 'usse_user_id', 'uslo_user_id']
    
    def _currentUserFieldsSearch(self):
        """
            Only where condition in search queries are impacted
        """
        return []
    
    def _permissions(self):
        """
            Carries dictionary of rules on which CRUD operations are permitted
            on the universal API nodes (restapi.views.list|crud).
            @todo: implement logic in Universal APIs
        """
        return {
            'default': {
                'path': 'users.permissions.users',
                'name': 'UserPermissions',
            },
        }

    def _defaults_order_by(self):
        return [
            {
                'tbl': 'usus',
                'col': 'update_time',
                'sort': 'DESC',
            },
            {
                'tbl': 'uspr',
                'col': 'create_time',
                'sort': 'DESC',
            },
            {
                'tbl': 'usse',
                'col': 'create_time',
                'sort': 'DESC',
            }
        ]

    def _defaults_where_conditions(self):
        return {
            "latest": self.values.latest('latest'),
            "usus_delete_time": 'IS NULL'
        }
    
    def _defaults_limit_value(self):
        """
            Should be returned in string format.
        """
        return '20'

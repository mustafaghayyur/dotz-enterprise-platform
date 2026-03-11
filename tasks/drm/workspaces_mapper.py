from core.DRMcore.mappers.RelationshipMappers import RelationshipMappers
from .mapper_values import WorkSpacesValuesMapper

class WorkSpacesMapper(RelationshipMappers):
    """
        All calls should be made to following method names without the '_' prefix.
        RelationshipMappers() has proper wrapper functions.
    """
    def startUpCode(self):
        """
            Used to insert operations in __init__()
        """
        # tables belonging to this mapper
        tables = ['wowo', 'wode', 'wous']
        self.state.set('mapperTables', tables)
        self.setValuesMapper(WorkSpacesValuesMapper)
        
    
    def _master(self):
        return {
            'table': 'users_department',
            'abbreviation': 'wowo',
            'foreignKeyName': 'workspace_id',
        }

    def _commonFields(self):
        """
            These keys tend to be found in every table and cause problems 
            if not handled separately. Master().foreignKeyName is not included.
        """
        return ['id', 'create_time', 'update_time', 'delete_time', 'latest']

    def _ignoreOnUpdates(self):
        """
            Can carry any fields within a table to ignore in a crud.update() operation
        """
        return {
            'wowo': ['id', 'creator_id', 'create_time'],
            'wode': ['id', 'latest', 'create_time', 'workspace_id'],
            'wous': ['id', 'latest', 'create_time', 'workspace_id'],
        }
    
    def _ignoreOnCreate(self):
        """
            Sets fields we can ignore in crud.create() proceses.
            Master().foreignKeyName is NOT included.
        """
        return {
            'wowo': ['delete_time', 'create_time', 'update_time', 'id'],
            'wode': ['delete_time', 'create_time', 'latest', 'id'],
            'wous': ['delete_time', 'create_time', 'latest', 'id'],
        }

    def _m2mFields(self):
        """
            Define first and second fields for M2M tables.
        """
        return {
            'wode': {
                'firstCol': 'workspace_id',
                'secondCol': 'department_id',
                'tables': ['wowo', 'dede']
            },
            'wous': {
                'firstCol': 'workspace_id',
                'secondCol': 'user_id',
                'tables': ['wowo', 'usus']
            },
        }
    
    def _dateFields(self):
        """
            Add all columns found in this mapper, that are date fields.
        """
        return ['create_time', 'update_time', 'delete_time']
    
    def _serializers(self):
        """
            returns serializers relevent to mapper
        """
        return {
            'default': {
                'path': 'tasks.validators.tasks',
                'generic': 'WorkSpaceO2ORecordSerializerGeneric',
                'lax': 'WorkSpaceO2ORecordSerializerLax',
                'strict': 'WorkSpaceO2ORecordSerializerStrict',
            },
            'wode': {
                'path': 'tasks.validators.comments',
                'generic': 'WSDepartmentSerializerGeneric',
                'lax': 'WSDepartmentSerializerLax',
                'strict': 'WSDepartmentSerializerStrict',
            },
            'wous': {
                'path': 'tasks.validators.watchers',
                'generic': 'WSUserSerializerGeneric',
                'lax': 'WSUserSerializerLax',
                'strict': 'WSUserSerializerStrict',
            },
        }
    
    def _crudClasses(self):
        """
            returns CRUD classes relevent to mapper
        """
        return {
            'default': {
                'path': 'tasks.drm.crud',
                'name': 'WorkSpaces',
            },
            'wode': {
                'path': 'tasks.drm.crud',
                'name': 'WorkSpaceUsers',
            },
            'wous': {
                'path': 'tasks.drm.crud',
                'name': 'WorkSpaceDepartments',
            },
        }
    
    def _currentUserFieldsCrud(self):
        """
            Returns list of fields which hold current user's id.
            Should allow limiting of external entries in these fields.
        """
        return ['creator_id']
    
    def _currentUserFieldsSearch(self):
        """
           Only where condition in search queries are impacted
        """
        return []
    
    def _permissions(self):
        """
            Carries dictionary of rules on which CRUD operations are permitted
            on the universal API nodes (restapi.views.list|crud).
        """
        return {
            'default': {
                'path': 'tasks.permissions.workspaces',
                'name': 'WorkSpacePermissions',
            },
        }

    def _defaults_order_by(self):
        return [
            {
                'tbl': 'wowo',
                'col': 'update_time',
                'sort': 'DESC',
            }
        ]

    def _defaults_where_conditions(self):
        return {
            "latest": self.values.latest('latest'), # left without table prefix for reasons.
            "wowo_delete_time": 'IS NULL',
        }
    
    def _defaults_limit_value(self):
        """
            Should be returned in string format.
        """
        return '20'


from core.DRMcore.mappers.RelationshipMappers import RelationshipMappers
from .mapper_values import TasksValuesMapper

class TasksMapper(RelationshipMappers):
    """
        All calls should be made to following method names without the '_' prefix.
        RelationshipMappers() has proper wrapper functions.
    """
    def startUpCode(self):
        """
            Used to insert operations in __init__()
        """
        # tables belonging to this mapper
        tables = ['tata', 'tade', 'tadl', 'tast', 'tavi', 'taas', 'tawo', 'taco', 'tawa', 'tate']
        self.state.set('mapperTables', tables)

        self.setValuesMapper(TasksValuesMapper)
    
    def _master(self):
        return {
            'table': 'tasks_task',
            'abbreviation': 'tata',
            'foreignKeyName': 'task_id',
        }

    def _commonFields(self):
        """
            These keys tend to be found in every table and cause problems 
            if not handled separately. Master().foreignKeyName is not included.
        """
        return ['id', 'create_time', 'update_time', 'delete_time', 'latest']

    def _ignoreOnUpdates(self):
        """
            Can carry any fields within a table to ignore in CRUD.update() operation.
        """
        return {
            'tata': ['id', 'create_time', 'creator_id'],
            'tade': ['id', 'latest', 'create_time', 'task_id'],
            'tadl': ['id', 'latest', 'create_time', 'task_id'],
            'tast': ['id', 'latest', 'create_time', 'task_id'],
            'tavi': ['id', 'latest', 'create_time', 'task_id'],
            'taas': ['id', 'latest', 'create_time', 'task_id'],
            'tawo': ['id', 'latest', 'create_time', 'task_id'],
            'taco': ['id', 'task_id'],
            'tawa': ['id', 'task_id'],
            'tate': ['id', 'task_id'],
        }
    
    def _ignoreOnCreate(self):
        """
            Sets fields we can ignore in crud.create() proceses.
            Master().foreignKeyName is NOT included.
        """
        return {
            'tata': ['delete_time', 'create_time', 'update_time', 'id'],
            'tade': ['delete_time', 'create_time', 'latest', 'id'],
            'tadl': ['delete_time', 'create_time', 'latest', 'id'],
            'tast': ['delete_time', 'create_time', 'latest', 'id'],
            'tavi': ['delete_time', 'create_time', 'latest', 'id'],
            'taas': ['delete_time', 'create_time', 'latest', 'id'],
            'tawo': ['delete_time', 'create_time', 'latest', 'id'],
            'tawa': ['delete_time', 'create_time', 'latest', 'id'],
            'taco': ['delete_time', 'create_time', 'update_time', 'id'],
            'tate': ['delete_time', 'create_time', 'update_time', 'id'],
        }

    def _m2mFields(self):
        """
            Define first and second fields for M2M tables.
        """
        return {
            'tawa': {
                'firstCol': 'task_id',
                'secondCol': 'watcher_id',
                'tables': ['tata', 'usus']
            },
        }
    
    def _dateFields(self):
        """
            Add all columns found in this mapper, that are date fields.
        """
        return ['create_time', 'update_time', 'delete_time', 'deadline']
    
    def _serializers(self):
        """
            returns serializers relevent to mapper
        """
        return {
            'default': {
                'path': 'tasks.validators.tasks',
                'generic': 'TaskO2ORecordSerializerGeneric',
                'lax': 'TaskO2ORecordSerializerLax',
                'strict': 'TaskO2ORecordSerializerStrict',
            },
            'taco': {
                'path': 'tasks.validators.taskRLCs',
                'generic': 'CommentSerializerGeneric',
                'lax': 'CommentSerializerLax',
                'strict': 'CommentSerializerStrict',
            },
            'tawa': {
                'path': 'tasks.validators.taskM2Ms',
                'generic': 'WatcherSerializerGeneric',
                'lax': 'WatcherSerializerLax',
                'strict': 'WatcherSerializerStrict',
            },
        }
    
    def _crudClasses(self):
        """
            returns CRUD classes relevent to mapper
        """
        return {
            'default': {
                'path': 'tasks.drm.crud',
                'name': 'Tasks',
            },
            'taco': {
                'path': 'tasks.drm.crud',
                'name': 'TaskComments',
            },
            'tawa': {
                'path': 'tasks.drm.crud',
                'name': 'TaskWatchers',
            },
        }
    

    def _currentUserFieldsCrud(self):
        """
            Returns list of fields which hold current user's id.
            Should allow limiting of external entries in these fields for create, update, delete and read operations.
        """
        return ['creator_id', 'watcher_id', 'commenter_id']
    
    def _currentUserFieldsSearch(self):
        """
            Returns fields that have restrictions so only current user id can be set in search.
            @todo: implement logic in QuertSetManager conditions()
        """
        return []
    
    def _permissions(self):
        """
            Carries dictionary of rules on which CRUD operations are permitted
            on the universal API nodes (restapi.views.list|crud).
        """
        return {
            'default': {
                'path': 'tasks.permissions.tasks',
                'name': 'TaskPermissions',
            },
        }


    def _defaults_order_by(self):
        return [
            {
                'tbl': 'tata',
                'col': 'update_time',
                'sort': 'DESC',
            },
            {
                'tbl': 'tade',
                'col': 'create_time',
                'sort': 'DESC',
            },
            {
                'tbl': 'tadl',
                'col': 'create_time',
                'sort': 'DESC',
            },
            {
                'tbl': 'tast',
                'col': 'create_time',
                'sort': 'DESC',
            },
            {
                'tbl': 'tavi',
                'col': 'create_time',
                'sort': 'DESC',
            },
            {
                'tbl': 'taas',
                'col': 'create_time',
                'sort': 'DESC',
            },
            {
                'tbl': 'tawo',
                'col': 'create_time',
                'sort': 'DESC',
            },
        ]

    def _defaults_where_conditions(self):
        return {
            "latest": self.values.latest('latest'), # left without table prefix for reasons.
            "tata_delete_time": 'IS NULL',
        }
    
    def _defaults_limit_value(self):
        """
            Should be returned in string format.
        """
        return '20'


from core.DRMcore.mappers.RelationshipMappers import RelationshipMappers
from .mapper_values import TasksValuesMapper
from core.helpers import misc

class TasksMapper(RelationshipMappers):
    def startUpCode(self):
        # tables belonging to this mapper
        tables = ['tata', 'tade', 'tadl', 'tast', 'tavi', 'taas', 'tawo', 'taco', 'tawa', 'tate', 'tapo', 'taup']
        self.state.set('mapperTables', tables)

        self.setValuesMapper(TasksValuesMapper)
    
    def _master(self):
        return {
            'table': 'tasks_task',
            'abbreviation': 'tata',
            'foreignKeyName': 'task_id',
        }

    def _m2mFields(self):
        return {
            'tawa': {
                'firstCol': 'task_id',
                'secondCol': 'watcher_id',
                'tables': ['tata', 'usus']
            },
            'taup': {
                'firstCol': 'task_id',
                'secondCol': 'contributor_id',
                'tables': ['tapo', 'usus']
            },
        }
    
    def _dateFields(self):
        info = super()._dateFields()
        info.extend(['deadline'])
        return info

    def _currentUserFieldsCrud(self):
        info = super()._currentUserFieldsCrud()
        info.extend(['watcher_id', 'commenter_id'])
        return info
    
    def _permissions(self):
        return {
            'default': {
                'path': 'tasks.permissions.tasks',
                'name': 'TaskPermissions',
            },
        }


    def _defaults_order_by(self):
        return [
            { 'tbl': 'tata', 'col': 'update_time', 'sort': 'DESC', },
            { 'tbl': 'tade', 'col': 'create_time', 'sort': 'DESC', },
            { 'tbl': 'tadl', 'col': 'create_time', 'sort': 'DESC', },
            { 'tbl': 'tast', 'col': 'create_time', 'sort': 'DESC', },
            { 'tbl': 'tavi', 'col': 'create_time', 'sort': 'DESC', },
            { 'tbl': 'taas', 'col': 'create_time', 'sort': 'DESC', },
            { 'tbl': 'tawo', 'col': 'create_time', 'sort': 'DESC', },
        ]

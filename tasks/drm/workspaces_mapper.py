from core.DRMcore.mappers.RelationshipMappers import RelationshipMappers
from .mapper_values import WorkSpacesValuesMapper

class WorkSpacesMapper(RelationshipMappers):
    def startUpCode(self):
        # tables belonging to this mapper
        tables = ['wowo', 'wode', 'wous', 'wote', 'wolc']
        self.state.set('mapperTables', tables)
        self.setValuesMapper(WorkSpacesValuesMapper)
        
    def _master(self):
        return {
            'table': 'tasks_workspace',
            'abbreviation': 'wowo',
            'foreignKeyName': 'workspace_id',
        }

    def _commonFields(self):
        info = super()._commonFields()
        return info.extend(['description'])    

    def _m2mFields(self):
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
    
    def _crudClasses(self):
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
            'wote': {
                'path': 'tasks.drm.crud',
                'name': 'WorkSpaceTerms',
            },
        }
    
    def _permissions(self):
        return {
            'default': {
                'path': 'tasks.permissions.workspaces',
                'name': 'WorkSpacePermissions',
            },
        }

    def _defaults_order_by(self):
        return [
            { 'tbl': 'wowo', 'col': 'update_time', 'sort': 'DESC',}
        ]
    
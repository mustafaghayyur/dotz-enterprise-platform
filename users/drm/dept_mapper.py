from core.DRMcore.mappers.RelationshipMappers import RelationshipMappers

class DepartmentsMapper(RelationshipMappers):
    def startUpCode(self):
        # tables belonging to this mapper
        tables = ['dede', 'dehe', 'deus']
        self.state.set('mapperTables', tables)

    def _master(self):
        return {
            'table': 'users_department',
            'abbreviation': 'dede',
            'foreignKeyName': 'department_id',
        }

    def _m2mFields(self):
        return {
            'dehe': {
                'firstCol': 'department_id',
                'secondCol': 'head_id',
                'tables': ['dede', 'usus']
            },
            'deus': {
                'firstCol': 'department_id',
                'secondCol': 'user_id',
                'tables': ['dede', 'usus']
            },
        }
    
    def _crudClasses(self):
        return {
            'default': {
                'path': 'users.drm.crud',
                'name': 'Departments',
            },
            'dehe': {
                'path': 'users.drm.crud',
                'name': 'DepartmentHeads',
            },
            'deus': {
                'path': 'users.drm.crud',
                'name': 'DepartmentUsers',
            },
        }
    
    def _currentUserFieldsCrud(self):
        info = super()._currentUserFieldsCrud()
        info.extend(['user_id', 'head_id'])
        return info
    
    def _permissions(self):
        return {
            'default': {
                'path': 'users.permissions.depts',
                'name': 'DepartmentPermissions',
            },
        }

    def _defaults_order_by(self):
        return [
            { 'tbl': 'dede', 'col': 'update_time', 'sort': 'DESC', },
        ]

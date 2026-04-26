from core.DRMcore.mappers.RelationshipMappers import RelationshipMappers
from .mapper_values import UsersValuesMapper

class UsersMapper(RelationshipMappers):
    def startUpCode(self):
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
    
    def _m2mFields(self):
        return {
            'usre': {
                'firstCol': 'reporter_id',
                'secondCol': 'reportsTo_id',
                'tables': ['usus']
            },
        }
    
    def _dateFields(self):
        info = super()._dateFields()
        info.extend(['date_joined'])
        return info
    
    def _currentUserFieldsCrud(self):
        # user entity seems to have unique circumtances...
        return ['usre_user_id', 'uspr_user_id', 'usse_user_id', 'uslo_user_id']
    
    def _permissions(self):
        return {
            'default': {
                'path': 'users.permissions.users',
                'name': 'UserPermissions',
            },
        }

    def _defaults_order_by(self):
        return [
            { 'tbl': 'usus', 'col': 'update_time', 'sort': 'DESC', },
            { 'tbl': 'uspr', 'col': 'create_time', 'sort': 'DESC', },
            { 'tbl': 'usse', 'col': 'create_time', 'sort': 'DESC', }
        ]

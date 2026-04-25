
class Skeleton():
    """
        All default values for various _methods() will be defined here.
    """
    def _master(self):
        """
            defines master table definitions.

            :returns { "table", "abbreviation", "foreignKeyName"}
        """
        return {
            'table': '#Error',
            'abbreviation': '#Error',
            'foreignKeyName': '#Error',
        }

    def _commonFields(self):
        """
            These keys tend to be found in every table and cause problems 
            if not handled separately. Master().foreignKeyName is not included.

            :returns ['fields', 'list']
        """
        return ['id', 'create_time', 'update_time', 'delete_time', 'latest']

    def _ignoreOnUpdates(self):
        """
            Can carry any fields within a table to ignore in CRUD.update() operation.
            
            :returns { "tbl-key" => ['fields', 'list'] }
        """
        return {
            'mt': ['id', 'create_time', 'creator_id'],
            'o2o': ['id', 'latest', 'create_time', self.master('foreignKeyName')],
            'rlc': ['id', self.master('foreignKeyName')],
            'm2m': ['id', self.master('foreignKeyName')],
        }
    
    def _ignoreOnCreate(self):
        """
            Sets fields we can ignore in crud.create() proceses.
            Master().foreignKeyName is NOT included.

            :returns { "tbl-key" => ['fields', 'list'] }
        """
        return {
            'mt': ['delete_time', 'create_time', 'update_time', 'id'],
            'o2o': ['delete_time', 'create_time', 'latest', 'id'],
            'rlc': ['delete_time', 'create_time', 'update_time', 'id'],
            'm2m': ['delete_time', 'create_time', 'latest', 'id'],
        }

    def _m2mFields(self):
        """
            Define first and second fields for M2M tables.

            :returns { "tbl-key" => { 'firstCol' => 'field', 'secondCol' => 'field', 'tables' => [tbl1, tbl2]} }
        """
        return {}
    
    def _dateFields(self):
        """
            Add all columns found in this mapper, that are date fields.

            :returns ['fields', 'list']
        """
        return ['create_time', 'update_time', 'delete_time']
    
    def _serializers(self):
        """
            Returns serializers relevent to mapper.

            :returns: {'default': {
                'path': '', 'generic': '', 'lax': '', 'strict': '',
            },}
        """
        return {
            'default': {
                'path': None,
                'generic': None,
                'lax': None,
                'strict': None,
            },
        }
    
    def _crudClasses(self):
        """
            returns CRUD classes relevent to mapper

            :returns: {'default': {
                'path': '', 'name': '',
            },}
        """
        return {
            'default': {
                'path': None,
                'name': None,
            },
        }
    

    def _currentUserFieldsCrud(self):
        """
            Returns list of fields which hold current user's id.
            Should allow limiting of external entries in these fields for create, update, delete and read operations.

            :returns ['fields', 'list']
        """
        return ['creator_id']
    
    def _currentUserFieldsSearch(self):
        """
            Returns fields that have restrictions so only current user id can be set in search.
            @todo: implement logic in QuertSetManager conditions()

            :returns ['fields', 'list']
        """
        return []
    
    def _permissions(self):
        """
            Carries dictionary of rules on which CRUD operations are permitted
            on the universal API nodes (restapi.views.list|crud).

            :returns: {'default': {
                'path': '', 'name': '',
            },}
        """
        return {
            'default': {
                'path': None,
                'name': None,
            },
        }


    def _defaults_order_by(self):
        """
            Sets defaults for all QuerySet.fetch() queries...

            :returns { tbl => mt, col => update_time, sort => DESC }
        """
        return [
            {
                'tbl': self.master('abbreviation'),
                'col': 'update_time',
                'sort': 'DESC',
            },
        ]

    def _defaults_where_conditions(self):
        """
            Sets defaults for all QuerySet.fetch() queries...

            :returns { key => value }
        """
        abbrv = self.master('abbreviation')
        return {
            "latest": self.values.latest('latest'), # left without table prefix for reasons.
            f"{abbrv}_delete_time": 'IS NULL',
        }
    
    def _defaults_limit_value(self):
        """
            Should be returned in string format.

            :returns '20'
        """
        return '20'
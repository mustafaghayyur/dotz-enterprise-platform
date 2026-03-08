from .base import BaseMapper

class RelationshipMappers(BaseMapper):
    """
        Along with BaseOperations(), RelationshipMappers() defines meaningful methods to
        access vital schema related info for all your database crud operations.

        References to _*() methods in the code point to data-definition functions defined
        in child classes in app-level.
    """
    def master(self, key = 'all'):
        info = self._master()
        return self.returnValue(info, key)

    def commonFields(self):
        return self._commonFields()

    def ignoreOnUpdates(self, key = 'all'):
        """
            @todo: confirm ids should be ignored on rlc & m2ms tables
        """
        info = self._ignoreOnUpdates()
        allTables = self.state.get('tables')
        if key not in allTables:
            # legacy management: ignoreOnUpdates() changed from full-names to abbreviations
            key = self.tableAbbreviation(key)

        return self.returnValue(info, key)
    
    def ignoreOnCreate(self, key = 'all'):
        info = self._ignoreOnCreate()
        return self.returnValue(info, key)


    def m2mFields(self, tbl = 'all'):
        relationships = self._m2mFields()
        return self.returnValue(relationships, tbl)
    
    def dateFields(self):
        """
            Returns all date fields defined in Mapper
        """
        return self._dateFields()
    
    def serializers(self, tblKey = 'default', type = 'generic'):
        """
            returns serializer(s) relevent to mapper/table-key
            
            :param tblKey: [str] key for table
            :param type: [str] enum of ['generic' | 'lax' | 'strict']
        """
        info = self._serializers()
        if tblKey is not None and tblKey in info:
            return self.imported({'path': info[tblKey]['path'], 'name': info[tblKey][type]})

        if tblKey in self.tables():
            return self.imported({'path': info['default']['path'], 'name': info['default'][type]})

        return None
    
    def crudClasses(self, tblKey = 'default'):
        """
            returns CRUD class(es) relevent to mapper/table-key
            
            :param tblKey: [str] key for table
        """
        info = self._crudClasses()
        if tblKey is not None and tblKey in info:
            return self.imported(info[tblKey])

        if tblKey in self.tables():
            return self.imported(info['default'])

        return None
    
    def currentUserFields(self, operation = 'crud'):
        """
            Returns list of fields which hold current user's id.
            Should allow limiting of external entries in these fields.
            When operation is set to read, returns fields that have read restrictions.

            :param operation: [str] enum of 'crud' | 'search'
        """
        if operation == 'crud':
            return self._currentUserFieldsCrud()
        if operation == 'search':
            return self._currentUserFieldsSearch()


    def permissions(self, tblKey = 'default'):
        """
            Carries modules handling rules on which CRUD and search operations are permitted
            on each table of mapper.

            :param tblKey: [str] key for table
        """
        info = self._permissions()
        if tblKey is not None and tblKey in info:
            return self.imported(info[tblKey])

        if tblKey in self.tables():
            return self.imported(info['default'])

        return None
    
    def defaults(self, requestedFunc):
        """
            Returns a self._defaults_{requestedFunc} method if defined (in app-level mapper definition).
        """
        if not isinstance(requestedFunc, str):
            raise Exception('Mapper.defaults() cannot execute provided function. Exiting.')

        requestedFunc = '_defaults_' + requestedFunc

        if hasattr(self, requestedFunc):
            functionCall = getattr(self, requestedFunc)
            if callable(functionCall):
                return functionCall()

        return None


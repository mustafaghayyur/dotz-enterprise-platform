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
        fields = self._commonFields()
        return fields if fields is not None else []

    def ignoreOnUpdates(self, key = 'all'):
        """
            @todo: confirm ids should be ignored on rlc & m2ms tables
        """
        info = self._ignoreOnUpdates()
        allTables = self.state.get('tables') or {}

        # legacy management: ignoreOnUpdates() changed from full-names to abbreviations
        if key not in allTables:
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
        fields = self._dateFields()
        return fields if fields is not None else []
    
    def serializers(self, tblKey = 'default', type = 'generic'):
        """
            returns serializer(s) relevent to mapper/table-key
            
            :param tblKey: [str] key for table
            :param type: [str] enum of ['generic' | 'lax' | 'strict']
        """
        allTables = self.tables() or {}
        if tblKey not in allTables:
            raise Exception('Error 1055: Table key not found in Mapper().serializers().')
        
        info = self._serializers()
        
        if info.get('default', None) is None or info.default.get('path', None) is None:
            app = self.modelPaths(tblKey)[0]
            tblType = self.typeOfThisTable(tblKey)

            if tblType in ['mt', 'o2o']:
                master = self.master('foreignKeyName')[:-3]
                identifier = master[0].upper() + master[1:] + 's'
                serType = 'o2o'
                key = 'default'
            if tblType in ['m2m', 'rlc']:
                model = self.models(tblKey)
                identifier = model[0].upper() + model[1:] + 's'
                serType = tblType
                key = tblType

            info[key] = {
                'path': app + '.validators.' + serType,
                'generic': identifier + serType.upper() + 'RecordSerializerGeneric',
                'lax': identifier + serType.upper() + 'RecordSerializerLax',
                'strict': identifier + serType.upper() + 'RecordSerializerStrict'
            }

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
        fields = None
        if operation == 'crud':
            fields = self._currentUserFieldsCrud()
        elif operation == 'search':
            fields = self._currentUserFieldsSearch()
        return fields if fields is not None else []


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

from core.dotzSettings import settings
from .background import Background
from ...helpers import misc, strings

class BaseMapper(Background):
    """
        This class and its inheritors will help map tables to data in 
        meaningful ways.
    """
    def tables(self, key = 'all'):
        """
            Grabs  all tables' full name in mapper from schema.
            Or retrieves any valid table-key's full table name.

            :returns [dict] of tbl => full_name | [str] full_name
        """
        tablesUsed = self.state.get('tablesUsed')
        allTables = self.state.get('tables')
        if key is not None and key in allTables:
            return allTables[key]
        
        info = { tbl: allTables.get(tbl, '#ERROR') for tbl in tablesUsed }
        return self.returnValue(info, key)

    def models(self, key = 'all'):
        """
            Grabs the model value(s) from schema for mapper table(s).
            Or retrieves any valid table-key's model.

            :returns [dict] of tbl => model | [str] model
        """
        tablesUsed = self.state.get('tablesUsed')
        allModels = self.state.get('models')

        if key is not None and key in allModels:
            return allModels[key]
        
        info = { tbl: allModels.get(tbl, '#ERROR') for tbl in tablesUsed }
        return self.returnValue(info, key)
    
    def modelPaths(self, key = 'all'):
        """
            Grabs the model-path value(s) from schema for mapper table(s).
            Or retrieves any valid table-key's model-path.

            :returns [dict] of tbl => path_values | [str] path_value
        """
        tablesUsed = self.state.get('tablesUsed')
        allPaths = self.state.get('paths')

        if key is not None and key in allPaths:
            return allPaths[key]
        
        info = { tbl: allPaths.get(tbl, '#ERROR') for tbl in tablesUsed }
        return self.returnValue(info, key)

    def tableFields(self, name = 'all'):
        """
            Grabs the table-cols list(s) from schema for each table in mappers.
            Or retrieves any valid table-key's list of columns.

            :returns [dict] of tbl => [col_list] | [list] of specific tbl columns
        """
        tablesUsed = self.state.get('tablesUsed')
        allColLists = self.state.get('cols')
        
        if name is not None and name in allColLists:
            return allColLists[name]  # only the 'name' table's columns list is sent back
        
        info = { tbl: allColLists.get(tbl, []) for tbl in tablesUsed }
        return self.returnValue(info, name)


    def typeOfTable(self, tblKey: str):
        """
            Retrieves data-model-type of any valid table-key provided.
            
            :param tblKey: [str] table key as defined in schema
            
            :returns enum from: 'o2o' | 'm2m' | 'rlc' or None on error
        """
        allTablesType = self.state.get('types')
        
        if tblKey in allTablesType:
            return allTablesType[tblKey]

        return None

    def tableAbbreviation(self, fullTableName = None):
        """
            Determine single full-table-name's correct abbreviation.
            Or return none.
        """
        allTables = self.state.get('tables')
        for tbl in allTables:
            if allTables[tbl] == fullTableName:
                return tbl
            
        return None
    

    def tableTypes(self, tblType: str):
        """
            Grabs the list of all tables in mapper with "tblType" relation-type. 
            
            :param tblType: [str] must be enum from: 'o2o' | 'm2m' | 'rlc'
            
            :returns [list] 
            @todo: confirm this returns correct list of tables...
        """
        if tblType not in settings.get('project.mapper.dataRelationshipTypes'):
            raise Exception('Error 1063: tblType argument must be one of valid table types: o2o, m2m, rlc.')
        
        info = []
        tablesUsed = self.state.get('tablesUsed')
        allTablesType = self.state.get('types')
        
        for tbl in tablesUsed:
            if tbl in allTablesType and allTablesType[tbl] == tblType:
                info.append(tbl)
                
        return info


    def isCommonField(self, key, prefix = False):
        """
            Determine whether field is common among children tables.
            @todo: remove third param 'prefix' from codebase and remove
        """
        field = self.prefixedFields(key, 'field')
        commons = self.commonFields()
        
        if field in commons:
            return True
        return False

    def generateO2OFields(self):
        """
            Only One-to-One records-types are handled.
        """
        o2oTables = self.tableTypes('o2o')  # fetch all o2o tables used
        return self.generateFieldsDict(o2oTables)
    
    def generateAllFields(self):
        """
            M2M, O2O and RLC tables are included.
        """
        tables = self.tables()  # fetch all tablesUsed
        tablesList = list(tables.keys())
        return self.generateFieldsDict(tablesList)

    def generateFieldsDict(self, tablesList):
        """
            Generates a dictionary holding all 'FieldNames' => 'table-key' pairs for given list of tables.

            :param tablesList: [list] provided tables list to process.
        """
        if not isinstance(tablesList, list):
            raise Exception('Error 1061: Mapper.generateFieldsDict() requires a list of table keys.')
        
        commonFields = self.commonFields()
        mapperTables = self.state.get('mapperTables')
        mtForeignKeyName = self.master('foreignKeyName')
        dictionary = {}  # open returned dictionary

        for tbl in tablesList:
            fields = self.tableFields(tbl)

            if not isinstance(fields, list):
                continue

            for field in fields:
                if field == mtForeignKeyName:
                    continue  # @todo: confirm behavior

                fullName = field
                if field in commonFields:
                    fullName = f'{tbl}_{field}'
                if tbl not in mapperTables:
                    fullName = f'{tbl}_{field}'

                dictionary[fullName] = tbl

        return dictionary


    def collectM2MTables(self):
        """
            Many-to-Many tables, by their definition, bring many tables/enities into the mix.
            This method collects all tables associated with the m2m tables of current mapper,
            and returns a list of all tables mentioned in Mapper._m2mFields() definition.
        """
        m2mEntities = self.m2mFields()
        tables = [] # bucket

        for entity in m2mEntities:
            array = []
            array.append(entity) # first add the entity key itself, should be a table key
            if isinstance(m2mEntities[entity]['tables'], list):
                array.extend(m2mEntities[entity]['tables']) # next, add the 'tables' value, which should be a list
            
            tables.extend(array) # finally, merge the array with tables

        return list(set(tables)) # only send back unique tables list


    def column(self, key):
        """
            In the future: if certain columns change name, this intermediary function
            can be used to translate them in legacy code.

            All columns should be referenced through this function.
        """
        return key
    
    def prefixedFields(self, fieldName, grab = 'both'):
        """
            Determines if fieldName has a table-key prefixed, if so returns one 
            or both based on options.

            :param fieldName: [str] string carrying fieldname
            :param grab: [str] enum of ['both', 'tbl', 'field']
        """
        if grab not in ['both', 'tbl', 'field']:
            raise Exception("Error 1062: Mapper().prefixedFields() requires grab to be an enum of ['both', 'tbl', 'field']")
        
        tables = self.state.get('tables')
        tbl = None
        field = fieldName
        parts = fieldName.split('_')
        
        if parts[0] is not None and parts[0] in tables:
            tbl = parts[0]
            field = strings.concatenate(parts[1:], '_')

        if grab == 'both':
            return [tbl, field]
        
        if grab == 'tbl':
            return tbl
        
        if grab == 'field':
            return field

        return None
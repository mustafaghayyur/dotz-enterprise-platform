from core.dotzSettings import settings
from .background import Background
from ...helpers import misc

class BaseMapper(Background):
    """
        This class and its inheritors will help map tables to data in 
        meaningful ways.
    """
    def tables(self, key = 'all'):
        """
            Grabs the table's (or all tables in mapper)'s full name from schema.
        """
        tablesUsed = self.state.get('tablesUsed')
        allTables = self.state.get('tables')
        if key is not None and key in tablesUsed:
            return allTables[key]
        
        info = { tbl: allTables[tbl] for tbl in tablesUsed }
        return self.returnValue(info, key)

    def models(self, key = 'all'):
        """
            Grabs the model value(s) from schema for mapper table(s).
        """
        tablesUsed = self.state.get('tablesUsed')
        allModels = self.state.get('models')
        if key is not None and key in tablesUsed:
            return allModels[key]
        
        info = { tbl: allModels[tbl] for tbl in tablesUsed }
        return self.returnValue(info, key)
    
    def modelPaths(self, key = 'all'):
        """
            Grabs the model-path value(s) from schema for mapper table(s).
        """
        tablesUsed = self.state.get('tablesUsed')
        allPaths = self.state.get('paths')
        if key is not None and key in tablesUsed:
            return allPaths[key]
        
        info = { tbl: allPaths[tbl] for tbl in tablesUsed }
        return self.returnValue(info, key)

    def tableFields(self, name = 'all'):
        """
            Grabs the table-cols list(s) from schema for each table in mappers.
        """
        tablesUsed = self.state.get('tablesUsed')
        allColLists = self.state.get('cols')
        
        if name is not None and name in tablesUsed:
            return allColLists[name]  # only the 'name' table's columns list is sent back
        
        info = { tbl: allColLists[tbl] for tbl in tablesUsed }
        return self.returnValue(info, name)
    
    def tableTypes(self, tblType: str):
        """
            Grabs the list of all tables in mapper with "type" relation-type from schema: 
            
            :param tblType: [str] must be enum from: 'o2o' | 'm2m' | 'rlc'
            
            :returns [list] @todo: confirm this returns correct list of tables...
        """
        tablesUsed = self.state.get('tablesUsed')
        allTablesType = self.state.get('types')
        
        info = [tbl for tbl in tablesUsed if tbl in allTablesType and allTablesType[tbl] == tblType]
        return info


    def typeOfTable(self, tblKey: str):
        """
            Retrieves data-model-type of table-key provided, if it exists in mapper.
            
            :param tblKey: [str] table key as defined in schema
            
            :returns enum from: 'o2o' | 'm2m' | 'rlc' or None on error
        """
        tablesUsed = self.state.get('tablesUsed')
        allTablesType = self.state.get('types')
        
        if tblKey in tablesUsed:
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


    def isCommonField(self, key, prefix = False):
        """
            Determine whether field is common among children tables.
        """
        sz = settings.get('project.mapper.tblKeySize')
        field = key[sz:] if prefix else key  # grab correct fieldName to compare
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
        dictionary = {}  # open returned dictionary

        for tbl in tablesList:
            fields = self.tableFields(tbl)

            if not isinstance(fields, list):
                continue

            for field in fields:
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

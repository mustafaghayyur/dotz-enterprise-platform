from django.db import models

from core.lib.state import State
from core.helpers import strings

class BackgroundOperations(models.QuerySet):
    """
        carries background operations for QuerySetManager()
    """
    state = None
    mapper = None  # mapper object that handles schema decisions

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.state = State()
        self.state.set('latestFlag', False)
        self.startUpCode()
        
        # set current table-key in state
        self.state.set('current', self.getCurrentTbl())

        # get mapperTables and save them to QSM() state
        mapperTables = self.mapper.state.get('mapperTables')
        self.state.set('mapperTables', mapperTables)

        # save the original mapper fields to state...
        self.state.set('o2oMapperFields', self.mapper.generateO2OFields())
        self.state.set('allMapperFields', self.mapper.generateAllFields())

    def getMapper(self):
        return self.mapper

    def setArgumentsInStates(self, selectors, conditions, ordering, limit, joins, translations):
        """
            sets the provided arguments (if any) into state keys
        """
        if selectors is not None:
            self.select(selectors)
        if conditions is not None:
            self.where(conditions)
        if ordering is not None:
            self.orderby(ordering)
        if limit is not None:
            self.limit(limit)
        if joins is not None:
            self.join(joins)
        if translations is not None:
            self.translate(translations)

        
    def updateMapperAndState(self):
        """
            Updates states in mapper and querysetmanager
        """
        # gather all the columns 
        columnsUsed = self.getColumnsUsed()

        # next we rebuild the mapper with collected tables...
        usedTables = self.compileUsedTablesList(columnsUsed)
        self.mapper.rebuildMapper(usedTables)

        # then we update states using Mapper functions
        allFields = self.mapper.generateAllFields()
        self.state.set('allUsedFields', allFields)

        # save tableUsed from Mapper() state -> to QSM() state
        tablesUsed = self.mapper.state.get('tablesUsed')
        self.state.set('tablesUsed', tablesUsed)

        # finally compile all tables with 'latest' flags enabled in 'revisionedTables'
        revisioned = self.mapper.tableTypes('m2m')
        o2os = self.mapper.tableTypes('o2o')
        revisioned.extend(o2os)
        self.state.set('revisionedTables', revisioned)
      

    def compileUsedTablesList(self, columnsUsed):
        """
            Takes list of columns supplied in fetch() arguments, and attempts to build a list of 
            table-keys.
            
            :param columnsUsed: [list] list of all columns supplied in arguments
        """
        tables = []
        mapperFields = self.state.get('allMapperFields')
        for field in columnsUsed:
            if isinstance(field, str) and field in mapperFields:
                tables.append(mapperFields[field])
                continue
            if isinstance(field, str) and field not in mapperFields:
                [tbl, col] = self.mapper.prefixedFields(field)  # strings.seperateTableKeyFromField(field, self.state)

                if isinstance(tbl, str) and isinstance(col, str):
                    fullTableName = self.mapper.tables(tbl)
                    if fullTableName is not None and isinstance(fullTableName, str):
                        tblCols = self.mapper.tableFields(tbl)
                        if tblCols is not None and isinstance(tblCols, list) and col in tblCols:
                            tables.append(tbl)
        
        return list(set(tables))  # only return uniques


    def getColumnsUsed(self):
        """
            collects all table references in parameters provided to fetch()
        """
        conditions = self.state.get('conditions', {})
        selectors = self.state.get('selectors', [])
        ordering = self.state.get('ordering', [])

        joins = self.extractTablesFromJoinInputs()

        columns = selectors
        columns.extend(list(conditions.keys()))
        if isinstance(ordering, list) and len(ordering) > 0:
            columns.extend([f'{ordr['tbl']}_{ordr['col']}' for ordr in ordering if 'tbl' in ordr and 'col' in ordr])
        columns.extend(joins)

        # return unique table list
        return list(set(columns))
    
    def extractTablesFromJoinInputs(self):
        """
            Takes join argument's dictionary's inputs and extracts tables from it.
        """
        tables = []
        joins = self.state.get('joins', {})
        
        array = []
        array.extend(list(joins.keys()))
        array.extend(list(joins.values()))

        for key in array:
            match = strings.seperateTableKeyFromJoinArgument(key, self.state)
            if len(match) > 1 and match[1] is not None:
                tables.append(match[1])

        return tables


    def getCurrentTbl(self):
        """
            Determines current tbl (key) for model of QuerySet
        """
        models = self.mapper.models()
        for tbl in models:
            if models[tbl] == self.model.__name__:
                return tbl
        return None
    
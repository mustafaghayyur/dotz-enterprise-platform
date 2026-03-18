from core.helpers import strings, misc

class Joins():
    """
        This is a static class.
        Helps parse and manage joins arguments.
    """

    @staticmethod 
    def parse(state, mapper):
        """
        Takes dictionary of Join definitions, along with native Mapper join functionaility,
        and ensures only valid, required tables are joined.
        
        :param state: QSM() state instance
        :param mapper: Mapper() instance
        """
        mt = mapper.master('abbreviation')
        mtId = mapper.master('foreignKeyName')
        joins = []
        tblsJoined = []  # bucket to keep track of added tables
        latestKey = mapper.column('latest')
        mapperTables = state.get('mapperTables', [])
        allTablesUsed = state.get('tablesUsed', [])
        revisionedTables = state.get('revisionedTables', [])
        joinsDict = state.get('joins', {})

        # first we add Mapper tables.
        for tbl in mapperTables:
            if tbl not in allTablesUsed:
                continue

            if tbl == mt or tbl == '':
                continue

            tableName = mapper.tables(tbl)
            joins.append(f' LEFT JOIN {tableName} AS {tbl} ON {mt}.id = {tbl}.{mtId}')
            tblsJoined.append(tbl)

            if state.get('latestFlag') and tbl in revisionedTables:
                joins.append(f' AND {tbl}.{latestKey} = %({latestKey})s')

        # next we add any additional tables specified in the joins argument to Manager.fetch()
        for leftStmt, rightStmt in joinsDict.items():            
            left = strings.seperateTableKeyFromJoinArgument(leftStmt, state)
            right = strings.seperateTableKeyFromJoinArgument(rightStmt, state)
            
            if not isinstance(left, list) or not isinstance(right, list) or len(left) < 2 or len(right) < 2:
                raise KeyError('Error 1011: Join statements formed incorrectly.')
            
            joinType = left[0][:-1]  # chop off '|' from end
            tbl1 = left[1]
            tbl2 = right[1]
            col1 = left[2]
            col2 = right[2]
            tbl2Type = mapper.typeOfTable(tbl2)

            if tbl2Type is None:
                raise Exception(f'Error 1013: Right table [{tbl2}] in Joins is not a recognized table.')

            if tbl1 in allTablesUsed and tbl2 in allTablesUsed:
                if tbl1 in tblsJoined or tbl1 == mt:
                    table2Name = mapper.tables(tbl2)  # fetch full table name
                    
                    joinTypeStmt =  'LEFT JOIN' if joinType is None else f'{joinType} JOIN'
                    
                    joins.append(f' {joinTypeStmt} {table2Name} AS {tbl2} ON {tbl1}.{col1} = {tbl2}.{col2}')
                    tblsJoined.append(tbl2)

                    if state.get('latestFlag') and tbl2Type in ['o2o', 'm2m']:  # @todo: change this list of types to a configured setting
                        joins.append(f' AND {tbl2}.{latestKey} = %({latestKey})s')

        return strings.concatenate(joins)
    
    @staticmethod
    def validate(joins):
        if joins is None:
            return {}
        
        if not isinstance(joins, dict):
            raise TypeError('Error 1012: Joins argument supplied must be a valid dictionary.')
    
        return joins
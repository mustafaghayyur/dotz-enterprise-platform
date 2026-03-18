from core.dotzSettings import settings
from core.helpers import crud, misc, strings

class Conditions():
    """
        This is a static class.
        Helps parse and manage where arguments.
    """

    @staticmethod
    def assemble(state, mapper):
        """
            Assembles workable conditions dictionary, from raw dictionary provided to QuerySetManager
        """
        conditions = state.get('conditions')
        defaults = mapper.defaults('where_conditions')

        if conditions is None:
            conditions = {}

        mergedConditions = misc.mergeDictionaries(defaults, conditions)
        latestKey = mapper.column('latest')

        if latestKey in mergedConditions:
            state.set('latestFlag', True)
            del mergedConditions[latestKey]

        return Conditions.validateAssembled(state, mergedConditions)
        
    
    @staticmethod 
    def parse(state, mapper):
        """
        Returns generated where statements in list format.
        
        :param state: State() instance
        :param mapper: Mapper() instance
        :param conditions: [dict] supplied to QuerySetManager()
        """
        conditions = state.get('assembledConditions')
        mapperTables = state.get('mapperTables')
        mapperFields = state.get('allMapperFields')
        usedFields = state.get('allUsedFields')
        array = []

        for key, value in conditions.items():
            length = Conditions.length(array)
            [tbl, col] = mapper.prefixedFields(key)  # strings.seperateTableKeyFromField(key, state)
            if tbl is None and col is not None:
                statement = Conditions.makeWhereStatement(state, mapper, mapperFields[key], key, value, length)
            if tbl is not None and col is not None:
                key = f'{tbl}_{col}'
                statement = Conditions.makeWhereStatement(state, mapper, usedFields[key], key, value, length)
            array.append(statement)
        
        return strings.concatenate(array)
    

    def makeWhereStatement(state, mapper, tbl, key, value, length):
        """
            Generates a where statement element with given key/value pair.
        """
        andPref = ''
        keyDb = key  # keyDb refers to the column name recognized by the database
        sz = settings.get('project.mapper.tblKeySize')

        if length > 0:
            andPref = ' AND '

        if mapper.isCommonField(key, True):
            keyDb = key[sz:]  # the table abbreviation is conjoined to key name.

        if key not in state.get('allMapperFields') and key in state.get('allUsedFields'):
            keyDb = key[sz:]

        # misc.log([key, keyDb, state.all()], "Inspecting all variables in Conditions.")

        if keyDb in mapper.dateFields():
            itemType = Conditions.determineDateArgumentType(state, value)
            
            if itemType is None:
                return ''
            
            match itemType[0]:
                case 'lastXDays':
                    return andPref + '(' + tbl + '.' + keyDb + ' >= NOW() - INTERVAL %(' + key + ')s DAY)'
                case 'range':
                    start = strings.formulateProperDate(itemType[1]['start'])
                    end = strings.formulateProperDate(itemType[1]['end'])
                    return andPref + '(' + tbl + '.' + keyDb + ' BETWEEN ' + start + ' AND ' + end + ')'
                case 'nullType':
                    return andPref + tbl + '.' + keyDb + ' ' + itemType[1]

        if isinstance(value, list):
            return andPref + tbl + '.' + keyDb + ' IN %(' + key + ')s'
        
        if strings.isPrimitiveType(value):
            return andPref + tbl + '.' + keyDb + ' = %(' + key + ')s'

        return ''  # return has to be string
        

    @staticmethod
    def validateAssembled(state, conditions):
        """
            Checks that all condition items should be primitive data types or lists.
            None values for conditions are ommitted.
        """
        usedFieldsDict = state.get('allUsedFields')
        conditionskeys = list(conditions.keys())  # copy keys of conditions to loop over

        for key in conditionskeys:
            if key in usedFieldsDict:
                if conditions[key] is None:
                    del conditions[key]
                    continue
                
                if strings.isPrimitiveType(conditions[key]) or isinstance(conditions[key], list):
                    continue  # todo: confirm behaviour. Should non-string primitives be stringi-fied?
            
            del conditions[key]  # delete the key from dictionary

        return conditions


    @staticmethod
    def length(array: list):
        """
            Calculates the string length of combined list (str) items.
            
            param: array [list] list of where statement strings
        """
        string = ''
        if not isinstance(array, list):
            return 0
        
        for item in array:
            if isinstance(item, str): 
                string += item

        return len(string)
    
    @staticmethod
    def validate(conditions):
        """
            Validates the initial conditions dictionary.
        """
        if not isinstance(conditions, dict):
            raise TypeError('Error 1030: conditions provided mut be in dict form.')
        
        for key, value in conditions.items():
            if not isinstance(key, str):
                raise TypeError("Error 1031: conditions' key not formed correctly.")
            if not strings.isPrimitiveType(value):
                if not isinstance(value, list):
                    raise TypeError("Error 1032: conditions' velue must be primitive or list type.")
            
        return conditions
    
    @staticmethod
    def determineDateArgumentType(state, dateArgument, dateOnly = False):
        """
            Returns None on failed analysis.
            Or a List with [0] index holding flag of argument type; and [1] index
            holding parsed argument value to sub into query formation.
        
            :param state: State() instance
            :param dateArgument: [str|int] defining acceptable date-field conditions
            :param dateOnly: [bool] weather field is date only (as opposed to datetime)
        """
        if dateOnly:
            pass # for future implmentation, incase date-only fileds need special handling
        
        argTmp = dateArgument.lower().strip()

        if argTmp == 'is null' or argTmp == 'is not null':
            return ['nullType', argTmp]
        
        if int(dateArgument) > 0:
            return ['lastXDays', dateArgument]
        
        if isinstance(dateArgument, str):
            # dates should be in format: 'YYYY-MM-DD hh:mm:ss'
            matches = strings.extractDateRangeFromString(dateArgument, state)
            
            if matches is not None:
                if isinstance(matches[1], str) and isinstance(matches[2], str):
                    return ['range', {'start': matches[1], 'end': matches[2]}]
            return None
            
        return None

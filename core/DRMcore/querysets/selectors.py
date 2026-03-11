from core.dotzSettings import settings
from core.helpers import strings

class Selectors():
    """
        This is a static class.
        Helps parse and manage select * arguments.
    """

    @staticmethod 
    def parse(state, mapper):
        """
            Forms the SELECT statement in the query.
        """
        selectors = state.get('selectors')
        mapperFields = state.get('allMapperFields')
        allUsedFields = state.get('allUsedFields')
        string = ''

        for key in selectors:
            if key in allUsedFields:
                if key in mapperFields:
                    # mapper fields belong to this mapper, need no special processing
                    string += Selectors.makeSelectString(state, mapper, key, mapperFields[key])
                else:
                    [tbl, col] = mapper.prefixedFields(key)  # strings.seperateTableKeyFromField(key, state)
                    if tbl is not None and col is not None:
                        string += Selectors.makeSelectString(state, mapper, key, allUsedFields[key], inMapper=False)
                    else:
                        raise KeyError('Error 1022: Some selector(s) are mal-formed. "[tbl]_field" format missing.')

        # chop off the last comma from returned string
        return string[:-1]
    

    @staticmethod
    def makeSelectString(state, mapper, field, tbl, inMapper = True):
        sz = settings.get('project.mapper.tblKeySize')
        current = state.get('current')
        string = ''
        addition = ''
        
        if inMapper:
            if mapper.isCommonField(field, True):
                # the table abbreviation is conjoined to key name. Separate:
                field = field[sz:]
                addition = f' AS {tbl}_{field}'
                
                if strings.fieldIdentifier(tbl, field) == current + '_' + mapper.column('id'):
                    # adds the current Model's key as 'id' and 'tblkey_id'
                    addition = f', {tbl}.{field} AS {tbl}_{field}'
                
            string += f' {tbl}.{field} {addition},'
        else:
            field = mapper.prefixedFields(field, 'field')
            string += f' {tbl}.{field} AS {tbl}_{field},'        
        return string

    @staticmethod
    def makeSelectStringNonMapper(state, mapper, fieldsDict):
        pass

    @staticmethod
    def validate(state, selectors):
        if not isinstance(selectors, list):
            raise TypeError('Error 1020: selectors have to be list type.')
        
        if len(selectors) == 0:
            raise TypeError('Error 1021: selectors missing.')
        
        if len(selectors) == 1 and selectors[0] == 'all':
            dictionary = state.get('o2oMapperFields')
            return list(dictionary.keys())
        
        array = []
        for key in selectors:
            if isinstance(key, str) and len(key) > 0:
                array.append(key)
            
        return array
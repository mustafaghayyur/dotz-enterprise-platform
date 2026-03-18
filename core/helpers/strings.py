import re

def concatenate(arrayStrings = [], separator = "\n"):
    """
        Concatenates (i.e. joins) list of strings with provided seperator.
        
        :param arrayStrings: [list]
        :param separator: [str] seperator stting to us efor joining
    """
    if isinstance(arrayStrings, list):
        return separator.join(arrayStrings)
    return None


def isPrimitiveType(item):
    """
        Primitive types are defined as being:
        Strings, Int, floats, Bool, None and Complex data  types.
    """
    if not isinstance(item, str):
        if not isinstance(item, int):
            if not isinstance(item, float):
                if not isinstance(item, bool):
                    if not isinstance(item, complex):
                        if item is None:
                            return True
                        else:
                            return False
    return True
    

def fieldIdentifier(tbl, col):
    """
        Generates a string identifier for column name in question.
        
        :param tbl: table abbreviation
        :param col: column name as seen in db table
    """
    if isinstance(tbl, str) and isinstance(col, str):
        return tbl + '_' + col
    return None


def seperateTableKeyFromField(field, state = None):
    """
        Seperates table key, field name, returning a list of [tbl, col]
        
        :param field: [str] field to inspect for table key prefixes.
        :param state: [State insatance | None] if supllied, compiled regex is stored in key 'regexDrmFieldKeys'
    """
    compiledRegex = None
    if state:
        compiledRegex = state.get('regexDrmFieldKeys')
    
    if compiledRegex is None:
        # 'left|[usus]_id': '[tawa]_watcher_id'
        compiledRegex = re.compile(r"(\w{4})_([\w]+)")
        if state:
            state.set('regexDrmFieldKeys', compiledRegex)

    match = compiledRegex.match(field)
    if match:
        return [match.group(1), match.group(2)]
    else:
        return [None, field]
    

def seperateTableKeyFromJoinArgument(definition, state = None):
    """
        Seperates join-type (optional), table key, and column-name, returns a list. 
        
        :param definition: join() argument in QuerySetManger().fetch()
        :param state: [State insatance | None] if supllied, compiled regex is stored in key 'regexDrmJoins'
    """
    compiledRegex = None
    if state:
        compiledRegex = state.get('regexDrmJoins')
    
    if compiledRegex is None:
        # 'left|[usus]_id': '[tawa]_watcher_id'
        compiledRegex = re.compile(r"(\w+\|)?(\w{4})_([\w]+)")
        if state:
            state.set('regexDrmJoins', compiledRegex)

    match = compiledRegex.match(definition)
    if match:
        return [match.group(1), match.group(2), match.group(3)]
    else:
        return []


def formulateProperDate(dateString, state = None):
    """
        Takes string for date, and attempts to extract and form valid datetime string.
        
        :param dateString: [str] datetime string provided
        :param state: State() instance (optional)
    """
    compiledRegex = None
    if state:
        compiledRegex = state.get('regexDrmDateValue')
    
    if compiledRegex is None:
        # '2026/02-29 12:29:29'
        compiledRegex = re.compile(r'\s?(\d{4})[\:\/\-]{1}(\d{2})[\:\/\-]{1}(\d{2})(\s\d{2}:\d{2}:\d{2})?', flags=re.I)
        if state:
            state.set('regexDrmDateValue', compiledRegex)
    
    match = compiledRegex.match(dateString)
    if match:
        time = '00:00:00' if match.group(4) is None else match.group(4)
        return match.group(1) + '-' + match.group(2) + '-' + match.group(3) + ' ' + time
    else:
        return None


def extractDateRangeFromString(string, state):
    """
        Regex function to extract from and to dates (range) and return a list.
        
        :param string: [str] string carrying date values to be parsed
        :param state: State() instance (optional). Can store compiled regex
    """
    compiledRegex = None
    if state:
        compiledRegex = state.get('regexDrmDatesRange')
    
    if compiledRegex is None:
        # 'from 2026-02-29 to 2028/05/06'
        compiledRegex = re.compile(r'\s?from\s(\d{4}[\:\/\-]{1}\d{2}[\:\/\-]{1}\d{2})\sto\s(\d{4}[\:\/\-]{1}\d{2}[\:\/\-]{1}\d{2})\s?', flags=re.I)
        if state:
            state.set('regexDrmDatesRange', compiledRegex)
    
    match = compiledRegex.match(string)
    if match:
        return [match.group(1), match.group(2)]
    else:
        return []
    

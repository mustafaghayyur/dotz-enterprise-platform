import importlib
from django.conf import settings as ds 
from django.forms import DateTimeInput
from . import misc, strings

def generateModelInfo(mapper, tbl):  # rdbms, space, tbl):
    """
        Takes a valid Mapper() insatance and valid table-key, and returns a dictionary
        of 'model', 'table' and 'cols' values. 
        
        :param mapper: Mapper() instance
        :param tbl: [str] table-key
    """
    tableName = mapper.tables(tbl)

    if tableName is None:
        raise Exception('Error 301: generateModelInfo() failed to identify table-key.')
    
    module = importlib.import_module(mapper.modelPaths(tbl))
    return {
        'model': getattr(module, mapper.models(tbl)),  # retrieve model class using importlib
        'table': tableName,  # identify table
        'cols': mapper.tableFields(tbl),  # grab column names
    }
    
def isValidId(dictionary, idKey):
    """
        Takes a dictionary and its key; determines if key's value is a valid ID value.
        
        :param dictionary: [dict] dictionary to handle
        :param idKey: [str|int] key from dict to use for valuation
    """
    if idKey in dictionary and dictionary[idKey] is not None:
        if not strings.isPrimitiveType(dictionary[idKey]):
            return False
        
        if isinstance(dictionary[idKey], int) and dictionary[idKey] > 0:
            return True

        if isinstance(dictionary[idKey], str) and dictionary[idKey].isdigit():
            item = int(dictionary[idKey])
            if item > 0:
                return True
            
    return False


def convertRecordsToDictionary(rawQuerySet, selectors):
    """
        Convert RawQuerySet / DB row objects into list of plain dicts keyed by list of selectors
        
        :param rawQuerySet: RawQuerySet object
        :param selectors: [list] array of valid selectors
    """
    records = []

    for rec in (rawQuerySet or []):
        row = {}
        for key in selectors:
            # RawQuerySet exposes selected columns as attributes named after the selector alias
            row[key] = getattr(rec, key, None)

        id = getattr(rec, 'id', None)
        if 'id' not in row or row['id'] is None:
            row['id'] = id

        records.append(row)

    return records


def generateError(object, additionalMsg = None):
    """
        Generates json friendly errors for RestAPI Response().
    """
    dictionary = {}
    dictionary['errors'] = str(object)
    # dictionary['errType'] =  str(type(object)) @todo : implement

    if additionalMsg is not None:
        dictionary['messages'] = additionalMsg
    
    if ds.DEBUG:
        misc.log(object, 'Error Trace:', 3) # logs the error with full trace in debug-mode only

    return dictionary


def generateResponse(results, page = 1, pageSize = 1, hasMore = False, additionalMsg = None):
    """
        Generates standard response object to send to RestAPI Response()
    """
    dictionary = {
        'page': page,
        'page_size': pageSize,
        'has_more': hasMore,
    }

    dictionary['results'] = results

    if additionalMsg is not None:
        dictionary['messages'] = additionalMsg

    return dictionary

class DateTimeLocalInput(DateTimeInput):
    # Needed by some CRUD operations.
    input_type = 'datetime-local'    

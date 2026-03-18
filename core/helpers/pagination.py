from . import strings, misc

def assembleParamsForView(limit, default = 20):
    """
        Assembles pagination definitions
        
        :param limit: limit sent as params
        :param default: default when no limit is found
        :returns dictionary with 'page', 'page_size' and 'offset' keys
    """
    okay = False
    default = int(default)
    maxLim = 100  # todo: is 1000 okay as a hard limit for entire system?

    if strings.isPrimitiveType(limit):
        page = 1
        if limit == 'all':
            limit = maxLim

        num = checkValue(limit)
        page_size = default if num is None else num
        okay = True
    
    if isinstance(limit, list):
        num1 = checkValue(limit[0])
        num2 = checkValue(limit[1])
        page = 1 if num1 is None else num1
        page_size = default if num2 is None else num2
        okay = True

    if not okay:
        page = 1
        page_size = default

    params = {}
    params['page'] = max(1, page)
    params['page_size'] = max(1, min(page_size, maxLim))
    params['offset'] = (params['page'] - 1) * params['page_size']
    return params

def checkValue(limit):
    """
        check individual value and convert to int
        
        :param limit: primitive value to convert to int
        :returns int|None
    """
    if strings.isPrimitiveType(limit):
        if isinstance(limit, int):
            return limit
        if not isinstance(limit, int):
            if isinstance(limit, str) and  limit.isdigit():
                return int(limit)
    return None

def determineHasMore(querySet, page_size):
    """
        Does this resultset have more pages (estimation)
        
        :param querySet: Django Model ResultSet
        :param page_size: size of page
    """
    return bool(querySet and len(querySet) == page_size)

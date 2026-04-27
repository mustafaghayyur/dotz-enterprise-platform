from core.helpers import misc

class Params():
    
    @staticmethod 
    def parse(state, mapper):
        """
            Filter and organize params to be passed to raw-query.
            @todo: remove datetime fields from params. They are subbed in manually
            @todo: perhaps make non-nullish datetime values remain in params? Deal with datetime fields fully when you have time.
            
            :returns [dict]
        """
        params = {}
        conditions = state.get('assembledConditions', {})

        for key, item in conditions.items():
            if isinstance(item, list):
                params[key] = tuple(item)
            if item is None:
                continue
            else:
                params[key] = item
                
        if state.get('latestFlag'):
            latestField = mapper.column('latest')
            params[latestField] = mapper.values.latest('latest')

        return params
    
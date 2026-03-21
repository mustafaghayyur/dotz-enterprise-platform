from .background import BackgroundOperations
from core.helpers.misc import log

from .conditions import Conditions
from .selectors import Selectors
from .params import Params
from .order import Ordering
from .limits import Limits
from .joins import Joins

class QuerySetManager(BackgroundOperations):
    """
        Offers the versatile .fetch() operation for fairly powerful Select queries.
        Manager().select().where().join().orderby().limit().translate().fetch()
        chaining is avilable.
    """
    def startUpCode(self):
        """
            Implemented in app-level inheritor
        """
        pass


    def fetch(self, selectors = None, conditions = None, ordering = None, limit = None, joins = None, translations = None):
        """
            Dotz CRM + PM's very own versatile SelectQuery Generator.
            Manager().select().where().join().orderby().limit().translate().fetch()
            avaialble.
            
            :param selectors: [list] list of O2O Fields desired in resultset.
            :param conditions: [dict] dictionary of key: value pairs for Where statement.
            :param ordering: [dict|str] ordering conditions
            :param limit: [list|int|str] limit conditions
            :param joins: [dict] join definitions
        """
        self.setArgumentsInStates(selectors, conditions, ordering, limit, joins, translations)
        self.updateMapperAndState()

        self.state.set('selectStatement', Selectors.parse(self.state, self.mapper))
        self.state.set('assembledConditions', Conditions.assemble(self.state, self.mapper))
        self.state.set('parameters', Params.parse(self.state, self.mapper))
        self.state.set('whereStatements', Conditions.parse(self.state, self.mapper))
        self.state.set('orderByStatement', Ordering.parse(self.state, self.mapper))
        self.state.set('limitStatement', Limits.parse(self.state, self.mapper))

        self.state.set('joinStatements', Joins.parse(self.state, self.mapper))

        query = f"""
            SELECT {self.state.get('selectStatement')}
            FROM {self.mapper.master('table')} AS {self.mapper.master('abbreviation')}
            {self.state.get('joinStatements')}
            WHERE {self.state.get('whereStatements')}
            ORDER BY {self.state.get('orderByStatement')} LIMIT {self.state.get('limitStatement')};
            """

        if self.state.get('translations.debug') == True:
            log([query, self.state.get('parameters')], 'QSM.fetch() QUERY STRING & PARAMS')

        translationsObj = self.state.get('translations', {})
        if 'debug' in translationsObj:
            del translationsObj['debug']

        return self.raw(query, self.state.get('parameters'), translationsObj)


    def select(self, selectors):
        """
            Sets the select from parameters.
        """
        self.state.set('selectors', Selectors.validate(self.state, selectors), [])
        return self

    def where(self, conditions):
        """
            Sets the conditions for the fetch chain.
        """
        self.state.set('conditions', Conditions.validate(conditions), {})
        return self

    def orderby(self, ordering):
        """
            Sets the ordering for the fetch chain.
        """
        self.state.set('ordering', Ordering.validate(ordering), [])
        return self

    def limit(self, limit):
        """
            Sets the limit(s) for the fetch chain.
        """
        self.state.set('limit', limit, [])
        return self

    def join(self, joins):
        """
            Sets the joins for the fetch chain.
        """
        self.state.set('joins', Joins.validate(joins), {})
        return self
    
    def translate(self, translations):
        """
            TBD @todo
        """
        self.state.set('translations', translations, {})
        return self
    
    def enableCurrentUserRestrictions(self, currentUser):
        """
            Enables current user restrictions on where condition fields.
            Needs appropriate definitions in Mapper().currentUserIdFieldsRead() setting
        """
        if currentUser is None:
            raise Exception('Error 1190: User information could not be parsed.')
        
        self.state.set('current_user', currentUser)
        return self




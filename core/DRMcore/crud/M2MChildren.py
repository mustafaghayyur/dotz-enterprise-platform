from django.utils import timezone
from . import Background
from core.helpers import crud, misc

from .create import Create
from .delete import Delete
from .checks import Validate


class CRUD(Background.Operations):
    """
        Many-to-Many CRUD Operations that can be used through out the system.
    """

    def __init__(self, *args, **kwargs):
        # Be sure to define these values in app-level inheritor:
        # self.state.set('tbl', None)  > table key recognized by mapper
        # self.state.set('pk', None)  > primary-key or "tbl_id" for this RLC table.
        super().__init__(self, *args, **kwargs)
        
        cols = self.mapper.m2mFields(self.state.get('tbl'))
        self.state.set('firstCol', cols['firstCol'])
        self.state.set('secondCol', cols['secondCol'])


    def create(self, dictionary):
        """
            Creation of a single record per M2M CT.
        """
        self.saveSubmission('create', dictionary)  # save to state

        t = crud.generateModelInfo(self.mapper, self.state.get('tbl'))

        if not crud.isValidId(self.state.get('submission'), self.state.get('firstCol')):
            return None
        if not crud.isValidId(self.state.get('submission'), self.state.get('secondCol')):
            return None
        
        # first, we attempt o update any existing records matching first & second M2M cols...
        Delete.allChildTableM2ms(self.state, self.mapper, t['model'], self.state.get('tbl'), t['table'], t['cols'])

        # next, we will create a new record for first and second columns.
        return Create.childTable(self.state, self.mapper, t['model'], self.state.get('tbl'), t['table'], t['cols'])
        
    def read(self, definitions):
        """
            See documentation on definitions formulation.
            @todo: add support for non-latest records
            @todo: is it wise to all all currentUserFields to definitions? Revisit if problems occur
        """
        if not isinstance(definitions, dict) or len(definitions) < 1:
            raise Exception(f'Error 2032: Fetch request for {self.state.get('firstCol')} and {self.state.get('secondCol')} failed. Improper definitions for query, in {self.state.get('app')}.CRUD.read()')

        # ensure latest field is added to definitions, if missing
        if 'latest' not in definitions:
            definitions['latest'] = self.mapper.values.latest('latest')
        
        # second, add any current user fields to definitions
        definitions = Validate.fillCurrentUserIdFields(self.state, self.mapper, definitions)

        t = crud.generateModelInfo(self.mapper, self.state.get('tbl'))
        rawObjs = None

        misc.log(definitions, 'definitions')
        if self.state.get('pk') in definitions:
            if crud.isValidId(definitions, self.state.get('pk')):
                # specific record being sought:
                rawObjs = t['model'].objects.fetchById(definitions[self.state.get('pk')])
            
        if self.state.get('firstCol') in definitions and self.state.get('secondCol') not in definitions:        
            if crud.isValidId(definitions, self.state.get('firstCol')):
                if definitions['latest']:
                    rawObjs = t['model'].objects.fetchAllCurrentByFirstId(definitions[self.state.get('firstCol')])
        
        if self.state.get('secondCol') in definitions and self.state.get('firstCol') not in definitions:
            if crud.isValidId(definitions, self.state.get('secondCol')):
                if definitions['latest']:
                    rawObjs = t['model'].objects.fetchAllCurrentBySecondId(definitions[self.state.get('secondCol')])
        
        if self.state.get('firstCol') in definitions and self.state.get('secondCol') in definitions:        
            if crud.isValidId(definitions, self.state.get('firstCol')) and crud.isValidId(definitions, self.state.get('secondCol')):
                rawObjs = t['model'].objects.fetchLatest(definitions[self.state.get('firstCol')], definitions[self.state.get('secondCol')], definitions['latest'])

        if rawObjs:
            return rawObjs

        return None

    def update(self, dictionary):
        """
            Direct update calls are not supported in M2M records.
        """
        return None

    def delete(self, dictionary):
        """
            Attempts to delete all records matching firstCol and SecondCol. 
        """
        self.saveSubmission('delete', dictionary)  # save to state

        if not crud.isValidId(self.state.get('submission'), self.state.get('firstCol')) or not crud.isValidId(self.state.get('submission'), self.state.get('secondCol')):
            raise Exception(f'Error 2031: M2M Record could not be deleted. Invalid IDs supplied in {self.state.get('app')}.CRUD.deleteM2M()')

        t = crud.generateModelInfo(self.mapper, self.state.get('tbl'))

        return Delete.allChildTableM2ms(self.state, self.mapper, t['model'], self.state.get('tbl'), t['table'], t['cols'])

    def deleteByFirstCol(self, firstColId):
        """
            Deletes all M2M-type children records for provided firstCol ID.
        """
        return None # implement this call only after careful security assessment.
        if not isinstance(firstColId, int) or firstColId < 1:
            raise Exception(f'Error 2030: M2M Records could not be deleted. Invalid single column ID supplied in {self.state.get('app')}.CRUD.deleteM2M()')

        t = crud.generateModelInfo(self.mapper, self.state.get('tbl'))

        return Delete.allChildTableFirstCol(self.state, self.mapper, t['model'], self.state.get('tbl'), t['table'], t['cols'], firstColId)

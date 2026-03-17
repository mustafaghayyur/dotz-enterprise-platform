from django.db import models
from . import Background
from core.helpers import crud
from core.lib.state import EmptyObject

from .create import Create
from .update import Update
from .delete import Delete

class CRUD(Background.Operations):
    """
        Generic CRUD Operations that can be used through out the system.
        One-to-One relationship CRUD types
    """
    def create(self, dictionary):
        """
            Validates a given dictionary of key: value pairs. If valid, 
            attempts to save to DB. Else, throws an exception.
        """
        self.saveSubmission('create', dictionary)  # save to state
        
        masterRecord = Create.masterTable(self.state, self.mapper, self.mapper.master('abbreviation'), self.state.get('mtModel'))
        idColumns = self.state.get('idCols')

        if not hasattr(masterRecord, self.mapper.column('id')) or not isinstance(masterRecord, models.Model):
            raise Exception(f'Error 2042: Something went wrong. {self.state.get('app')} record could not be created in: {self.state.get('app')}.CRUD.create().')

        self.state.get('submission')[self.mapper.master('foreignKeyName')] = masterRecord.id  # add master table ID to dictionary

        # Time to create child records, loop through each child table:
        for pk in idColumns:
            if pk == self.mapper.master('abbreviation') + '_' + self.mapper.column('id'):
                continue

            tbl = pk[:self.state.get('abrvSize')]  # table abbreviation
            t = crud.generateModelInfo(self.mapper, tbl)

            Create.childTable(self.state, self.mapper, t['model'], tbl, t['table'], t['cols'])

        # return masterRecord.id
        return masterRecord

    def read(self, selectors, conditions = None, orderBy = None, limit = None, joins = None, translations = None):
        """
            See documentation on how to form selectors, conditions, etc.
            Chaining enabled when no arguments are provided.
            @return: RawQuerySet | None

            @todo: make read static
        """
        if selectors is None and conditions is None and orderBy is None and limit is None and joins is None and translations is None:
            return self.state.get('mtModel').objects  # chaining method initiated
        
        return self.state.get('mtModel').objects.fetch(selectors, conditions, orderBy, limit, joins, translations)

    def update(self, dictionary):
        """
            Validates a given dictionary of key: walue pairs. If valid, 
            attempts to save to DB. Else, throws an exception.
        """
        self.saveSubmission('update', dictionary)  # save to state

        mId = self.mapper.master('abbreviation') + '_' + self.mapper.column('id')
        idColumns = self.state.get('idCols')

        records = self.fullRecord(self.state.get('submission')[mId])

        if not records:
            raise Exception(f'Error 2041: No valid record found for provided {self.state.get('app')} ID, in: {self.state.get('app')}.CRUD.update().')

        if len(records) > 1:
            completeRecord = self.pruneLatestRecords(records, mId)
        else:
            completeRecord = records[0]

        # Loop through each defined Primary Key to see if its table needs an update
        for pk in idColumns:
            tbl = pk[:self.state.get('abrvSize')]  # child table abbreviation
            t = crud.generateModelInfo(self.mapper, tbl)

            if pk == mId:
                if crud.isValidId(self.state.get('submission'), pk):
                    Update.masterTable(self.state, self.mapper, t['model'], t['table'], t['cols'], completeRecord)
                    continue
            
            # @todo: we could remove the need for child-ids from updates, making front-end dev easier. Not very important.
            if pk not in self.state.get('submission'):
                Create.childTable(self.state, self.mapper, t['model'], tbl, t['table'], t['cols'])
                continue
                
            if not crud.isValidId(self.state.get('submission'), pk):
                # create a new record for child table if pk is invalid
                Create.childTable(self.state, self.mapper, t['model'], tbl, t['table'], t['cols'])
                continue

            # determine if an update is necessary and carry out update operations...
            Update.childTable(self.state, self.mapper, t['model'], tbl, t['table'], t['cols'], completeRecord)

        # since .update() operation only returns # of rows affected, not the updated record.
        result = EmptyObject()
        result.id = self.state.get('submission')[mId]
        return result 

    def delete(self, masterId):
        """
            Validates a given record ID. If valid, attempts to  mark record
            as deleted in DB. Else, throws an exception.
        """
        mtId = self.mapper.master('abbreviation') + '_' + self.mapper.column('id')
        idColumns = self.state.get('idCols')

        if not crud.isValidId({mtId: masterId}, mtId):
            raise Exception(f'Error 2040: {self.state.get('app')} Record could not be deleted. Invalid id supplied in {self.state.get('app')}.CRUD.delete()')

        for pk in idColumns:
            tbl = pk[:self.state.get('abrvSize')]  # table abbreviation

            if pk == mtId:
                continue  # skip, we delete master table at the end.

            t = crud.generateModelInfo(self.mapper, tbl)

            # run a 'delete' operation for latest child table record. 
            Delete.childTable(self.state, self.mapper, t['model'], tbl, t['table'], t['cols'], masterId)

        # once all children records have been updated with delete markers
        t = crud.generateModelInfo(self.mapper, self.mapper.master('abbreviation'))
        return Delete.masterTable(self.state, self.mapper, t['model'], self.mapper.master('foreignKeyName'), t['table'], t['cols'], masterId)





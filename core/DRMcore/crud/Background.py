from django.conf import settings as ds  # stands for django-settings
from django.utils import timezone

from core.lib.state import State
from core.dotzSettings import settings
from .validation import Validate
from .logger import Logger
from core.helpers import crud

class Operations():
    """
        This class holds the background operations.
    """
    state = None
    mapper = None

    def __init__(self, *args, **kwargs):
        self.state = State()        
        self.state.set('abrvSize', settings.get('project.mapper.tblKeySize') - 1)

        if kwargs.get('current_user', None) is None:
            raise Exception('Error 2020: User information could not be parsed.')
        
        self.state.set('current_user', kwargs.get('current_user', None))

        self.startUpCode()

        # loads configs related to the module (defined in self.state.get('app'))
        self.state.set('module', settings.get(self.state.get('app')))

        # setup logger
        self.state.set('log', Logger())
        self.state.get('log').settings(self.state.get('app'))

        # holds all O2O primary keys for given space/module
        self.state.set('idCols', Validate.generateIdColumnsForRelationType(self.mapper, 'o2o'))
        
        
    def startUpCode(self):
        """
            Used by app-level inheritor classes to run init processes.
        """
        pass


    def setMasterCrudClass(self, classReference):
        if self.state.get('current_user') is None:
            raise Exception('Error 2021: Current User information is missing, cannot set Master CRUD reference.')
        
        self.state.set('masterCrudObj', classReference(current_user=self.state.get('current_user')))


    def saveSubmission(self, operation, submission):
        Validate.dictValidation(self.state.get('app'), operation, submission)
        submission = Validate.fillCurrentUserIdFields(self.state, self.mapper, submission)

        if operation != 'create':
            submission = Validate.mtIdValidation(self.mapper, self.state.get('app'), operation, submission)
            
        # save the submitted form into state
        self.state.set('submission', submission)


    def checkChildForMultipleLatests(self, modelClass, tbl, tableName, columnsList, fetchedRecords):
        """
            For given CT, see if fetched records have multiple entries 
            marked as 'latest' in the DB. If found, archives all but the most recent.

            @todo: not pruning records...fix
        """
        tblIdField = f'{tbl}_{self.mapper.column('id')}'
        createTimeField = f'{tbl}_{self.mapper.column('create_time')}'
        latestField = f'{tbl}_{self.mapper.column('latest')}'
        latestValue = self.mapper.values.latest('latest')
        archiveValue = self.mapper.values.latest('archive')
        logger = self.state.get('log')
        logger.record(None, f'Commencing checkChildForMultipleLatests() for {tableName}')
        
        # Group records by child table ID
        recordsByCtId = {}
        for record in fetchedRecords:
            ctId = getattr(record, tblIdField, None)
            if ctId is not None and ctId not in recordsByCtId:
                recordsByCtId[ctId] = record
                logger.record(None, f'[ctId: {ctId}] - record added to recordsByCtId')
        
        logger.record(recordsByCtId, f'Final recordsByCtId dictionary.')
        
        # For each child table ID, check if there are multiple 'latest' records
        latestRecords = [rec for rec in recordsByCtId]
        logger.record(latestRecords, f'Dict-to-List conversion of recs: latestRecords')

        if len(latestRecords) > 1:
            # Multiple records marked as latest, need to prune
            # Sort by create_time (most recent first)
            latestRecords.sort(
                key=lambda rec: getattr(rec, createTimeField, None) or '',
                reverse=True
            )

            logger.record(latestRecords, f'Sorted list of recs (by create-time): latestRecords')
            
            # Keep the first (most recent), archive the rest (mark as latest=2)
            for recordId in latestRecords[1:]:
                logger.record(recordId, f'attempting deleting of {tbl} with id: {recordId}')
                modelClass.objects.filter(id=recordId).update(latest=archiveValue, delete_time=timezone.now())

        logger.record(modelClass, f'End of checkChildForMultipleLatests() for {tableName}')

    def pruneLatestRecords(self, fetchedRecords, mId, iter = 1):
        """
            Handles scenario where multiple CT records are found to be marked 
            'latest' in DB. These multiples need to be pruned to a single record 
            for each CT.

            :param fetchedRecords: [list] array of fetched records' model instances
            :param mId: [int] id of MT record
            :param iter: [int] iteration of pruneLatestRecords() being called
        """
        self.state.get('log').record(fetchedRecords, 'Error: Full Record Retrieval Found multiple CT records. Commencing pruneLatestRecords()')
        idColumns = self.state.get('idCols')
        
        for pk in idColumns:
            tbl = pk[:self.state.get('abrvSize')]  # table abbreviation

            if pk == self.mapper.master('abbreviation') + '_' + self.mapper.column('id'):
                continue  # can't prune MT duplicates...

            t = crud.generateModelInfo(self.mapper, tbl)

            self.checkChildForMultipleLatests(t['model'], tbl, t['table'], t['cols'], fetchedRecords)

        records = self.fullRecord(mId)

        if not records:
            self.state.get('log').record(records, f'Error 2090: No valid record found for provided ID {mId}, after running pruneLatestRecords(), in: {self.state.get('app')}.CRUD.update().')
            raise Exception(f'Error 2090: No valid record found for provided ID, after running pruneLatestRecords(), in: {self.state.get('app')}.CRUD.update().')

        if len(records) > 1:
            if iter > 5:
                self.state.get('log').record(records, f'Error 2091: Maximum pruneLatestRecords() iterations reached. Unable to prune Latest Records. Proceeding with [0] index record.')
                return records[0]
            
            self.state.get('log').record(records, 'Running pruneLatestRecords() again, multiple records remain.')
            return self.pruneLatestRecords(records, mId, iter + 1)  # bit if recursion

        self.state.get('log').record({ '#OfRecords': len(records), 'records': records }, 'Records found at end of pruneLatestRecords()')
        return records[0]
    

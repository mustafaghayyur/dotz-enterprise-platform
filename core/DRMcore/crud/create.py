from django.db import models
from django.utils import timezone

from core.helpers import crud, strings
from .values import Values

class Create:
    """
        Static class
        Handles all create operations for CRUD
    """

    @staticmethod
    def childTable(state, mapper, modelClass, tbl, tableName, columnsList, rlc = False):
        """
            Creates specific child table's record.
        
            :param state: State() instance
            :param mapper: Mapper() instance
            :param modelClass: table's Model class reference
            :param tbl: [str] table key/identifier
            :param tableName: [str] table full name
            :param columnsList: [list] columns of specified table
            :param rlc: [bool] is RevisionLess Children record
        """
        state.get('log').record(None, f'Entering create operation for childtable: [{tableName}]')
        
        submission = state.get('submission')
        ignored = mapper.ignoreOnCreate(tbl)
        fields = {}

        for col in columnsList:
            if mapper.isCommonField(col):
                key = tbl + col  # add on a prefix to match submission keys
            else:
                key = col

            if col not in ignored and key in submission:
                if isinstance(submission[key], models.Model):
                    submission[key] = Values.convertModelToId(submission[key])
                
                if col in mapper.dateFields():
                    submission[key] = Values.fixTimeZones(submission[key])
                
                fields[col] = submission[key]
                state.get('log').record([key, submission[key]], 'Field added')

        if len(fields) <= 1:  # if record is empty, abort insertion...
            if mapper.master('foreignKeyName') in fields:
                return None  # only the master ID is added, no need need to insert

        fields[mapper.column('create_time')] = timezone.now()
        if rlc:
            fields[mapper.column('update_time')] = fields[mapper.column('create_time')]
        else:
            fields[mapper.column('latest')] = 1

        record = modelClass(**fields)
        record.save()
        designation = '[RLC]' if rlc else ''
        state.get('log').record({'fields': fields}, f'Create For: [{tableName}] | {designation}')
        return record


    @staticmethod
    def masterTable(state, mapper, tbl, modelClass):
        """
            Creates single new Master table record.

            :param state: State() instance
            :param mapper: Mapper() instance
            :param tbl: [str] table key/identifier
            :param modelClass: table's Model class reference
        """
        t = crud.generateModelInfo(mapper, tbl)
        state.get('log').record(None, f'Entering create operation for MT: [{t['table']}]')
        
        submission = state.get('submission')
        ignored = mapper.ignoreOnCreate(tbl)
        fields = {}

        for col in t['cols']:
            # get the correct key reference for column in submission...
            if mapper.isCommonField(col):
                key = tbl + col  # add on a prefix to match submission keys
            else:
                key = col

            if col not in ignored and key in submission:
                if isinstance(submission[key], models.Model):
                    submission[key] = Values.convertModelToId(submission[key])
                
                if col in mapper.dateFields():
                    submission[key] = Values.fixTimeZones(submission[key])
                
                fields[col] = submission[key]
                state.get('log').record([key, submission[key]], 'Field added')

        if len(fields) == 0:  # if fields is empty, abort insertion...
            return None

        fields[mapper.column('create_time')] = timezone.now()
        fields[mapper.column('update_time')] = fields[mapper.column('create_time')]

        if mapper.column('creator_id') in t['cols']:
            fields = Create.generateCreatorId(state, mapper, fields)

        record = modelClass(**fields)
        record.save()
        state.get('log').record({'fields': fields}, f'Create For: [{t['table']}]')
        return record
    

    @staticmethod
    def generateCreatorId(state, mapper, fields):
        """
            Attempts to assign creator_id using current-user object.
            Else, a field 'assignor_id', if available.
            Else returns non-modified fields dict.
            
            :param state: State() instance
            :param fields: [dict]
        """
        submission = state.get('submission')
        userKey = mapper.column('current_user')
        assignorKey = mapper.column('assignor_id')
        creatorKey = mapper.column('creator_id')

        if not isinstance(fields, dict):
            raise Exception('Error 2080: generateCreatorId() requires a dictionary for fields.')
        
        if userKey in submission:
            if submission[userKey] is not None:
                if strings.isPrimitiveType(submission[userKey]):
                    fields[creatorKey] = submission[userKey]
                if isinstance(submission[userKey], object) and  hasattr(submission[userKey], mapper.column('id')):
                    fields[creatorKey] = submission[userKey].id
        
        if assignorKey in submission:
            if submission[assignorKey] is not None:
                if strings.isPrimitiveType(submission[assignorKey]):
                    fields[creatorKey] = submission[assignorKey]
                if hasattr(submission[assignorKey], 'id'):
                    fields[creatorKey] = submission[assignorKey].id
                
        return fields
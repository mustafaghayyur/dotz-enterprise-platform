from django.db import models
from django.utils import timezone
from core.helpers import crud, strings
from .create import Create
from .values import Values
from core.lib.state import EmptyObject

class Update:
    """
        Static class
        Handles all update operations for CRUD
    """

    @staticmethod
    def masterTable(state, mapper, mtModel, tableName, columnsList, completeRecord):
        """
            Updates master table.
            
            :param state: State() instance
            :param mapper: Mapper() instance
            :param mtModel: MT Model class reference
            :param tableName: [str] full table name
            :param columnsList: [list] columns of table in question
            :param completeRecord: QuerySet result Model insatnce
        """
        state.get('log').record(None, f'ENTERING update for MT [{tableName}]')

        if not completeRecord.id or completeRecord.id is None:
            raise Exception(f'Error 2011: Error Something went wrong. Update record not found in system. {state.get('app')}.CRUD.update()')

        fields = {}
        submission = state.get('submission')
        ignored = mapper.ignoreOnUpdates(mapper.master('abbreviation'))

        for col in columnsList:
            if mapper.isCommonField(col):
                key = mapper.master('abbreviation') + '_' + col  # need tbl_abbrv prefix for comparison
            else:
                key = col

            if col not in ignored and key in submission:
                if isinstance(submission[key], models.Model):
                    submission[key] = Values.convertModelToId(submission[key])
                
                if col in mapper.dateFields():
                    dbVal = Values.fixTimeZones(getattr(completeRecord, col))
                else:
                    dbVal = getattr(completeRecord, col)
                
                state.get('log').record([key, col], 'comparing in MT Update')

                if submission[key] != dbVal:
                    fields[col] = submission[key]
                    state.get('log').record([key, submission[key], col, dbVal], 'MISMATCH')

        fields['update_time'] = timezone.now()

        mtModel.objects.filter(id=completeRecord.id).update(**fields)
        state.get('log').record({'fields': fields}, f'Update For: [{tableName}]')
        return None


    @staticmethod
    def childTable(state, mapper, modelClass, tbl, tableName, columnsList, completeRecord, rlc = False):
        """
            Updates specific child table
            
            :param state: State() instance
            :param mapper: Mapper() instance
            :param modelClass: table's Model class reference
            :param tbl: [str] table key/identifier
            :param tableName: [str] table full name
            :param columnsList: [list] columns of specified table
            :param completeRecord: Queryset result Model obj
            :param rlc: [bool] is RevisionLess Children record
        """
        state.get('log').record(None, f'ENTERING update for childtable [{tableName}]')

        if not hasattr(completeRecord, tbl + '_' + mapper.column('id')) or getattr(completeRecord, tbl + '_' + mapper.column('id')) is None:
            raise Exception(f'Error 2010: Something went wrong. Update record not found in system. {state.get('app')}.CRUD.update()')

        updateRequired = False
        ignored = mapper.ignoreOnUpdates(tbl)
        rlcFields = {}  # fields for RLC update; non-rlc recs don't modify existing records...
        submission = state.get('submission')
        result = None

        for col in columnsList:
            if mapper.isCommonField(col):
                key = tbl + col  # need tbl-abbrv prefix for comparison
            else:
                key = col

            if col not in ignored and key in submission:
                if isinstance(submission[key], models.Model):
                    submission[key] = Values.convertModelToId(submission[key])
                
                if col in mapper.dateFields():
                    dbVal = Values.fixTimeZones(getattr(completeRecord, col))
                else:
                    dbVal = getattr(completeRecord, col)

                state.get('log').record([key, col], 'comparing in CT Update')

                if submission[key] != dbVal:
                    state.get('log').record([key, submission[key], col, dbVal], f'MISMATCH -  update needed')
                    rlcFields[col] = dbVal
                    updateRequired = True  # changes found in dictionary record

        if updateRequired:
            if rlc:
                rlcFields['update_time'] = timezone.now()
                
                # result can be returned to user (in RLC)...
                result = EmptyObject()
                result.id = getattr(completeRecord, tbl + '_' + mapper.column('id'))
                modelClass.objects.filter(id=result.id).update(**rlcFields)
                state.get('log').record({'fields': rlcFields}, f'Update For: [{tableName}] | [RLC]')
            else:
                fields = {}
                fields['delete_time'] = timezone.now()
                fields['latest'] = mapper.values.latest('archive')
                
                # update old record, create new one...
                modelClass.objects.filter(id=getattr(completeRecord, tbl + '_' + mapper.column('id'))).update(**fields)
                state.get('log').record({'fields': fields}, f'Update For: [{tableName}]')
                result =  Create.childTable(state, mapper, modelClass, tbl, tableName, columnsList)

        return result



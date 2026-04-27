from .QuerySet import QuerySetManager
from core.helpers import misc

"""
=======================================================================
    Children QuerySets will be based on the various data-models we use
    in Dotz Enterprise Platform...
=====================================================================
"""

class CTQuerySet(QuerySetManager):
    """
        Primarily for One-to-One types

        Though this class carries some common functions needed by all 
        child tables of Master Table (M2M, RLC).
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state.set('tblIdentifier', f', id AS {self.state.get("current")}_id')
        self.state.set('mtForeignKeyName', self.mapper.master('foreignKeyName'))
        self.state.set('currentTableFullName', self.mapper.tables(self.state.get('current')))

    def fetchById(self, cId):
        """
            Fetch specific CT record by its own ID.
            Applies to O2O, M2M, M2M and RLC Records
        """
        query = f"""
            SELECT * {self.state.get('tblIdentifier')} FROM {self.state.get('currentTableFullName')}
                WHERE id = %s;
            """
        return self.raw(query, [cId])

    def fetchLatest(self, mtId):
        """
            Fetch the latest of child table record for MT ID.
            One to One records
        """
        query = f"""
            SELECT * {self.state.get('tblIdentifier')} FROM {self.state.get('currentTableFullName')}
                WHERE {self.state.get('mtForeignKeyName')} = %s
                AND latest = %s
                ORDER BY create_time DESC
                LIMIT 1;
            """

        latest = self.mapper.values.latest('latest')
        return self.raw(query, [mtId, latest])

    def fetchRevision(self, mtId, revision = 0):
        """
            Fetch a specific revision # of child table record for MT ID.
            When dealing with revisions we try not to fetch by IDs. This is
            wasteful spending.
            We instead refer to revisions by their chronological place (in
            reverse). So index[0] will be the current record. Then index[1]
            will be the last revision before the current one. And so forth.
            
            For One to One records
        """
        query = f"""
            SELECT * {self.state.get('tblIdentifier')} FROM {self.state.get('currentTableFullName')}
                WHERE {self.state.get('mtForeignKeyName')} = %s
                ORDER BY create_time DESC
                LIMIT 1 OFFSET (%s);
            """

        return self.raw(query, [mtId, revision])

    def fetchAllRevisionsByMasterId(self, mtId):
        """
            Fetch all revisions of child table record for MT ID.
            One to One records
        """
        query = f"""
            SELECT * {self.state.get('tblIdentifier')} FROM {self.state.get('currentTableFullName')}
                WHERE {self.state.get('mtForeignKeyName')} = %s
                ORDER BY create_time DESC
            """

        return self.raw(query, [mtId])  # returns the whole rawqueryset

    

class RLCQuerySet(CTQuerySet):
    """
        Revision-less Children (RLC) data models. 

        These have no revisions, thus no 'latest' field. However, 
        they too carry a one-to-many relationship with the MT.
    """
    def fetchAllByMasterIdRLC(self, mtId):
        """
            Revision Less children records don't have the 'latest' columns.
            I.e. they don't have revisions.
        """
        query = f"""
            SELECT * {self.state.get('tblIdentifier')} FROM {self.state.get('currentTableFullName')}
                WHERE {self.state.get('mtForeignKeyName')} = %s
                ORDER BY create_time DESC
            """

        return self.raw(query, [mtId])

class M2MQuerySet(CTQuerySet):
    """
        Many-to-Many data models. 

        These also carry revisions. Typically the MT is the First-Table-Id, 
        and a outside-entity is the Second-Table-Id.

        First and Second cols defined in space's Mappers
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        cols = self.mapper.m2mFields(self.state.get('current'))

        if cols is None:
            raise Exception('Error 290: Unable to fetch M2M Fields. Aborting. For: ' + self.model.__name__)
        
        self.state.set('firstColumn', cols['firstCol'])
        self.state.set('secondColumn', cols['secondCol'])
        

    def fetchAllCurrentBySecondId(self, secondId):
        """
            Fetch all the latest of child table records referencing secondId.
        """
        query = f"""
            SELECT * {self.state.get('tblIdentifier')} FROM {self.state.get('currentTableFullName')}
                WHERE {self.state.get('secondColumn')} = %s
                AND latest = %s
            """

        latest = self.mapper.values.latest('latest')
        return self.raw(query, [secondId, latest])
    
    def fetchAllCurrentByFirstId(self, firstId):
        """
            Fetch all the latest of child table records referencing firstId.
        """
        query = f"""
            SELECT * {self.state.get('tblIdentifier')} FROM {self.state.get('currentTableFullName')}
                WHERE {self.state.get('firstColumn')} = %s
                AND latest = %s
            """

        latest = self.mapper.values.latest('latest')
        return self.raw(query, [firstId, latest])
    
    def fetchLatest(self, firstId, secondId, latest):
        """
            Fetch latest rec for First & Second Ids.
            Overwrites CTQuerySet.fetchLatest()
        """
        query = f"""
            SELECT * {self.state.get('tblIdentifier')} FROM {self.state.get('currentTableFullName')}
                WHERE {self.state.get('firstColumn')} = %s
                AND {self.state.get('secondColumn')} = %s
                AND latest = %s
                ORDER BY create_time DESC
            """

        return self.raw(query, [firstId, secondId, latest])

    def fetchAllRevisions(self, firstId, secondId):
        """
            Fetch revision history of CT records for First & Second Ids.
        """
        query = f"""
            SELECT * {self.state.get('tblIdentifier')} FROM {self.state.get('currentTableFullName')}
                WHERE {self.state.get('firstColumn')} = %s
                AND {self.state.get('secondColumn')} = %s
                ORDER BY create_time DESC
            """

        return self.raw(query, [firstId, secondId])

    def fetchRevision(self, firstId, secondId, revision = 0):
        """
            Fetch a specific revision # (zero-indexed) of child table record 
            for One Id.
        """
        query = f"""
            SELECT * {self.state.get('tblIdentifier')} FROM {self.state.get('currentTableFullName')}
                WHERE {self.state.get('firstColumn')} = %s
                AND {self.state.get('secondColumn')} = %s
                ORDER BY create_time DESC
                LIMIT 1 OFFSET (%s);
            """

        return self.raw(query, [firstId, secondId, revision])

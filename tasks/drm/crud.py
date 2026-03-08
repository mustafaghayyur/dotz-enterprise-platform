from core.DRMcore.crud import O2ORecords, RevisionlessChildren, M2MChildren

from tasks import models
from .tasks_mapper import TasksMapper
from .workspaces_mapper import WorkSpacesMapper

class Tasks(O2ORecords.CRUD):
    """
        Handles all O2O crud operations for Tasks Module of DotzCRM.
        Please read the README.md in this folder before using.
    """
    def startUpCode(self):
        self.state.set('app', 'tasks')  # holds the name of current module/space
        self.state.set('mtModel', models.Task)  # holds the class reference for Master Table's model
        self.mapper = TasksMapper()
        

    def fullRecord(self, task_id):
        """
            fetch full O2O record with all CT records marked 'latest'
        """
        conditions = {
            "tata_update_time": None,
            "latest": self.mapper.values.latest('latest'),
            "visibility": None,
            "status": None,
            "tata_id": task_id,
        }

        recordKeysDict = self.mapper.generateO2OFields()  # returns a dictionary
        selectors = list(recordKeysDict.keys())

        rawObj = self.read(selectors, conditions)

        if rawObj:
            return rawObj  # returns all records found.
        return None


class TaskComments(RevisionlessChildren.CRUD):
    """
        Comments are a RLC table type.
        All CRUD operations for Comments within Task module, are handled by
        this class.
    """
    def startUpCode(self):
        self.state.set('app', 'tasks')  # holds the name of current module/space
        self.state.set('mtModel', models.Task)  # holds the class reference for Master Table's model
        self.state.set('tbl', 'taco')
        self.state.set('pk', 'taco_id')
        self.mapper = TasksMapper()
        
        self.setMasterCrudClass(Tasks)


class TaskWatchers(M2MChildren.CRUD):
    """
       This is a Many-to-Many relations table, where many 'watchers' are
       being assigned to many Tasks' record.
    """
    def startUpCode(self):
        self.state.set('pk', 'tawa_id')  # set table_abbrv for use in queries.
        self.state.set('app', 'tasks')  # holds the name of current module/space
        self.state.set('tbl', 'tawa')
        self.mapper = TasksMapper()
        



##### WorkSpaces Crud #####

class WorkSpaces(O2ORecords.CRUD):
    """
        Handles all O2O crud operations for WorkSpaces Mapper.
    """
    def startUpCode(self):
        self.state.set('app', 'users')  # holds the name of current module/space
        self.state.set('mtModel', models.Department)  # holds the class reference for Master Table's model
        self.mapper = WorkSpacesMapper()
        
    def fullRecord(self, wrkSpcId):
        """
            fetch full records with all CT records marked 'latest'
        """
        conditions = {
            "latest": self.mapper.values.latest('latest'),
            "wowo_id": wrkSpcId,
        }

        rawObj = self.read(['all'], conditions)
        if rawObj:
            return rawObj
        
        return None

        
class WorkSpaceUsers(M2MChildren.CRUD):
    """
        WorkSpace User. M2M
    """
    def startUpCode(self):
        self.state.set('app', 'tasks')
        self.state.set('pk', 'wous_id')
        self.state.set('tbl', 'wous')
        self.mapper = WorkSpacesMapper()

class WorkSpaceDepartments(M2MChildren.CRUD):
    """
        WorkSpace Department. M2M
    """
    def startUpCode(self):
        self.state.set('app', 'tasks')
        self.state.set('pk', 'wode_id')
        self.state.set('tbl', 'wode')
        self.mapper = WorkSpacesMapper()


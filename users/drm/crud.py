from core.DRMcore.crud import O2ORecords, RevisionlessChildren, M2MChildren

from users import models
from .users_mapper import UsersMapper
from .dept_mapper import DepartmentsMapper

class Users(O2ORecords.CRUD):
    """
        Handles all O2O crud operations for Users Module.
    """
    def startUpCode(self):
        self.state.set('app', 'users')  # holds the name of current module/space
        self.state.set('mtModel', models.User)  # holds the class reference for Master Table's model
        self.mapper = UsersMapper()
        
    def fullRecord(self, userId):
        """
            fetch full records with all CT records marked 'latest'
        """
        conditions = {
            "latest": self.mapper.values.latest('latest'),
            "usus_id": userId,
        }

        rawObj = self.read(['all'], conditions)
        if rawObj:
            return rawObj
        
        return None


class UserSettings(RevisionlessChildren.CRUD):
    """
        User settings. RLC crud operations
    """
    def startUpCode(self):
        self.state.set('app', 'tasks')  # holds the name of current module/space
        self.state.set('mtModel', models.User)  # holds the class reference for Master Table's model
        self.state.set('tbl', 'usse')
        self.state.set('pk', 'usse_id')
        self.mapper = UsersMapper()
        self.setMasterCrudClass(Users)


class UserLog(RevisionlessChildren.CRUD):
    """
        User edit log. RLC crud operations
    """
    def startUpCode(self):
        self.state.set('app', 'tasks')  # holds the name of current module/space
        self.state.set('mtModel', models.User)  # holds the class reference for Master Table's model
        self.state.set('tbl', 'uslo')
        self.state.set('pk', 'uslo_id')
        self.mapper = UsersMapper()
        self.setMasterCrudClass(Users)


class ReportsTo(M2MChildren.CRUD):
    """
        ReportsTo M2M
    """
    def startUpCode(self):
        self.state.set('pk', 'usre_id')  # set table_abbrv for use in queries.
        self.state.set('app', 'users')  # holds the name of current module/space
        self.state.set('tbl', 'usre')
        self.mapper = UsersMapper()



##### Departments Crud #####

class Departments(O2ORecords.CRUD):
    """
        Handles all O2O crud operations for Departments Mapper.
    """
    def startUpCode(self):
        self.state.set('app', 'users')  # holds the name of current module/space
        self.state.set('mtModel', models.Department)  # holds the class reference for Master Table's model
        self.mapper = DepartmentsMapper()
        
    def fullRecord(self, deptId):
        """
            fetch full records with all CT records marked 'latest'
        """
        conditions = {
            "latest": self.mapper.values.latest('latest'),
            "dede_id": deptId,
        }

        rawObj = self.read(['all'], conditions)
        if rawObj:
            return rawObj
        
        return None

        
class DepartmentHeads(M2MChildren.CRUD):
    """
        Department Heads M2M
    """
    def startUpCode(self):
        self.state.set('app', 'users')
        self.state.set('pk', 'dehe_id')
        self.state.set('tbl', 'dehe')
        self.mapper = UsersMapper()

class DepartmentUsers(M2MChildren.CRUD):
    """
        Department Users M2M
    """
    def startUpCode(self):
        self.state.set('app', 'users')
        self.state.set('pk', 'deus_id')
        self.state.set('tbl', 'deus')
        self.mapper = UsersMapper()

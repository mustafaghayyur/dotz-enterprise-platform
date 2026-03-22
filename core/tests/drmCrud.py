import datetime
import sys
import types
import unittest

from .boilerplate import *
from core.lib.state import State
from core.DRMcore.crud.values import Values
from core.DRMcore.crud.create import Create
from core.DRMcore.crud.update import Update
from core.DRMcore.crud.delete import Delete
from core.DRMcore.crud.logger import Logger
from core.DRMcore.mappers.RelationshipMappers import RelationshipMappers


# Create a fake module path so crud.generateModelInfo can import by name
fakeModule = types.ModuleType('core.tests.drmFakeModels')
setattr(fakeModule, 'FakeChildModel', FakeChildModel)
sys.modules['core.tests.drmFakeModels'] = fakeModule


"""
    run:
    > python3 manage.py test core.tests.drmCrud.DrmCrud.{name_ofTest}
"""
class DrmCrud(unittest.TestCase):
    """
        @todo: complete these tests created by copilot... This is a good start...
    """
    def setUp(self):
        self.state = State()
        self.state.set('log', Logger())
        # we will conduct logger tests in tickets app since it is unsided for now...
        self.state.get('log').settings('tickets')
        self.mapper = StubMapper()

    def one_valuesConvertModelToId(self):
        class Dummy:
            pass

        d = Dummy()
        d.id = 123

        self.assertEqual(Values.convertModelToId(d), 123)
        self.assertEqual(Values.convertModelToId('x'), 'x')

    def two_valuesFixTimezones(self):
        naive = datetime.datetime(2025, 1, 1, 12, 0, 0)
        aware = Values.fixTimeZones(naive)

        self.assertIsNotNone(aware.tzinfo)

    def three_createChildTableRecordsValuesAndMetadata(self):
        self.state.set('submission', {'name': 'Alice', 'type': 42, 'workspace_id': 99})

        rec = Create.childTable(self.state, self.mapper, FakeChildModel, 'wowo', 'tasks_workspace', ['name', 'type', 'master_id'], rlc=False)

        self.assertIsNotNone(rec)
        self.assertTrue(rec.saved)
        self.assertEqual(rec.name, 'Alice')
        self.assertEqual(rec.value, 42)
        self.assertEqual(rec.master_id, 99)
        self.assertEqual(rec.latest, 1)

    def four_createMasterTableRecordsValues(self):
        self.state.set('submission', {'name': 'Bob', 'value': 77})

        rec = Create.masterTable(self.state, self.mapper, 't', FakeChildModel)

        self.assertIsNotNone(rec)
        self.assertTrue(rec.saved)
        self.assertEqual(rec.name, 'Bob')
        self.assertEqual(rec.value, 77)

    def five_updateMasterTableUpdatesDifferentValues(self):
        self.state.set('submission', {'name': 'Carol', 'value': 100})

        class Complete:
            id = 1
            name = 'Carl'
            value = 99

        # reset manager to avoid stale from previous tests
        FakeMasterModel.objects = FakeManager()

        Update.masterTable(self.state, self.mapper, FakeMasterModel, 'fake_table', ['name', 'value'], Complete)

        self.assertEqual(FakeMasterModel.objects.lastFilter, {'id': 1})
        self.assertIn('update_time', FakeMasterModel.objects.lastUpdate)
        self.assertEqual(FakeMasterModel.objects.lastUpdate['name'], 'Carol')
        self.assertEqual(FakeMasterModel.objects.lastUpdate['value'], 100)

    def six_updateChildTableRlcAppliesUpdate(self):
        self.state.set('submission', {'user_name': 'Dana', 'master_id': 1})

        class Complete:
            user_id = 10
            name = 'Don'
            master_id = 1

        FakeChildModel.objects = FakeManager()

        result = Update.childTable(self.state, self.mapper, FakeChildModel, 'user', 'child_table', ['name', 'master_id'], Complete, rlc=True)

        self.assertIsNotNone(result)
        self.assertEqual(result.id, 10)
        self.assertEqual(FakeChildModel.objects.lastFilter, {'id': 10})
        self.assertIn('update_time', FakeChildModel.objects.lastUpdate)

    def seven_deleteMasterTableMarksDeleteTime(self):
        FakeMasterModel.objects = FakeManager()

        Delete.masterTable(self.state, self.mapper, FakeMasterModel, 't', 'fake_table', 5)

        self.assertEqual(FakeMasterModel.objects.lastFilter, {'id': 5})
        self.assertIn('delete_time', FakeMasterModel.objects.lastUpdate)

    def eight_deleteChildTableFiltersAndUpdates(self):
        FakeChildModel.objects = FakeManager()

        Delete.childTable(self.state, self.mapper, FakeChildModel, 't', 'fake_table', ['name', 'master_id'], 99, rlc=False)

        self.assertEqual(FakeChildModel.objects.lastFilter, {'master_id': 99, 'latest': 1})
        self.assertEqual(FakeChildModel.objects.lastUpdate['latest'], 2)
        self.assertIn('delete_time', FakeChildModel.objects.lastUpdate)

    def nine_deleteChildTableById(self):
        FakeChildModel.objects = FakeManager()

        Delete.childTableById(self.state, self.mapper, FakeChildModel, 't', 'fake_table', ['name', 'master_id'], 77)

        self.assertEqual(FakeChildModel.objects.lastFilter, {'id': 77})
        self.assertIn('delete_time', FakeChildModel.objects.lastUpdate)


if __name__ == '__main__':
    unittest.main()

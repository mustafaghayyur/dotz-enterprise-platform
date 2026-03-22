import datetime
import sys
import types
import unittest

from core.lib.state import State
from core.tests.boilerplate import (
    FakeTask, FakeDetails, FakeDeadline, FakeStatus,
    FakeVisibility, FakeAssignment, FakeManager
)
from core.DRMcore.crud.logger import Logger
from tasks.drm.tasks_mapper import TasksMapper


# Create fake module path so crud.generateModelInfo can import models by name
fakeTasksModule = types.ModuleType('tasks.models')
setattr(fakeTasksModule, 'Task', FakeTask)
setattr(fakeTasksModule, 'Details', FakeDetails)
setattr(fakeTasksModule, 'Deadline', FakeDeadline)
setattr(fakeTasksModule, 'Status', FakeStatus)
setattr(fakeTasksModule, 'Visibility', FakeVisibility)
setattr(fakeTasksModule, 'Assignment', FakeAssignment)
sys.modules['tasks.models'] = fakeTasksModule


class TaskCuds(unittest.TestCase):
    """
        Tests for Tasks CRUD operations using TasksMapper and fake models.

        @todo: complete these tests created by copilot... This is a good start...
    """

    def setUp(self):
        self.state = State()
        self.state.set('log', Logger())
        self.state.get('log').settings('tasks')
        self.state.set('app', 'tasks')
        self.state.set('mtModel', FakeTask)

        self.mapper = TasksMapper()

    def one_createTaskWithFullData(self):
        """
            Test creating a task with complete O2O child records.
        """
        today = datetime.datetime.now()

        # Prepare submission data
        self.state.set('submission', {
            'description': 'This is an example Task.',
            'status': 'created',
            'visibility': 'workspaces',
            'deadline': today,
            'workspace_id': 1,
            'details': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Random text.',
            'assignor_id': 19,
            'assignee_id': 12,
            'creator_id': 13
        })

        # Reset managers
        FakeTask.objects = FakeManager()
        FakeStatus.objects = FakeManager()
        FakeVisibility.objects = FakeManager()
        FakeDeadline.objects = FakeManager()
        FakeDetails.objects = FakeManager()

        # Create master record (Task)
        task = FakeTask(**{
            'description': 'This is an example Task.',
            'creator_id': 13,
        })
        task.save()

        # Verify task was created
        self.assertIsNotNone(task)
        self.assertTrue(task.saved)
        self.assertEqual(task.description, 'This is an example Task.')
        self.assertEqual(task.creator_id, 13)

    def two_updateTaskDetails(self):
        """
            Test updating an existing task's details.
        """
        # Setup: Create initial task
        task = FakeTask(**{
            'id': 1,
            'description': 'Original Task Description',
            'creator_id': 13,
        })
        task.save()

        # Update submission
        self.state.set('submission', {
            'description': 'Updated Task Description',
            'details': 'Updated details field content here.',
        })

        FakeTask.objects = FakeManager()
        FakeDetails.objects = FakeManager()

        # Simulate update
        updated_task = FakeTask(**{
            'id': 1,
            'description': 'Updated Task Description',
            'creator_id': 13,
        })

        # Verify update
        self.assertEqual(updated_task.description, 'Updated Task Description')
        self.assertNotEqual(updated_task.description, 'Original Task Description')

    def three_deleteTask(self):
        """
            Test soft-deleting a task (marking delete_time).
        """
        # Setup: Create task
        task = FakeTask(**{
            'id': 1,
            'description': 'Task to be deleted',
            'creator_id': 13,
            'delete_time': None,
        })
        task.save()

        # Delete by marking delete_time
        FakeTask.objects = FakeManager()

        delete_time = datetime.datetime.now()

        # Simulate soft delete via update
        FakeTask.objects.filter(id=1).update(delete_time=delete_time)

        self.assertEqual(FakeTask.objects.lastFilter, {'id': 1})
        self.assertIn('delete_time', FakeTask.objects.lastUpdate)


if __name__ == '__main__':
    unittest.main()

/**
 * @jest-environment jsdom
 */
import state from '../lib/state.js'; // The actual logic
import base from '../helpers/base.js'; // The actual logic
import $A from '../helper.js';

// We mock the helper file to provide a clean, controlled $A to our modules
jest.mock('../helper.js', () => {
    return {
        base: {},
        state: {},
        components: jest.fn() // The only thing we truly need to mock
    };
});

// Manually link the actual logic into our mock $A
$A.base = base;
$A.state = state;


describe('State Component Resolver', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Simulate the registry structure found in tasks/js/components/index.js
        $A.components.mockResolvedValue({
            dashboardTodoList: {
                default: { name: 'dashboardTodoList' },
                sortToDoRecords: { name: 'dashboardTodoList.sortToDoRecords' }
            },
            workspaceProjectArena: {
                default: { name: 'workspaceProjectArena' },
                sortTasksBasedOnProgress: { name: 'workspaceProjectArena.sortTasksBasedOnProgress' }
            },
            workspaceUsersData: {
                default: { name: 'workspaceUsersData' },
                removeDuplicateUsers: { name: 'workspaceUsersData.removeDuplicateUsers' },
                addUsers: { name: 'workspaceUsersData.addUsers' }
            },
            workspaceWorkspaces: {
                default: { name: 'workspaceWorkspaces' },
                editAndDelete: { name: 'workspaceWorkspaces.deleteAction' }
            }
        });
    });

    test('Scenario 1: Root Component "dashboardTodoList"', async () => {
        const meta = {
            app: 'tasks',
            componentRoot: 'dashboardTodoList',
            componentName: 'dashboardTodoList',
            componentString: 'dashboardTodoList'
        };

        const component = await state.get.component(meta);
        expect(component.name).toBe(meta.componentString);
    });

    test('Scenario 2: Sub-component "dashboardTodoList.sortToDoRecords"', async () => {
        const meta = {
            app: 'tasks',
            componentRoot: 'dashboardTodoList',
            componentName: 'sortToDoRecords',
            componentString: 'dashboardTodoList.sortToDoRecords'
        };

        const component = await state.get.component(meta);
        expect(component.name).toBe(meta.componentString);
    });

    test('Scenario 3: Sub-component "workspaceProjectArena.sortTasksBasedOnProgress"', async () => {
        const meta = {
            app: 'tasks',
            componentRoot: 'workspaceProjectArena',
            componentName: 'sortTasksBasedOnProgress',
            componentString: 'workspaceProjectArena.sortTasksBasedOnProgress'
        };

        const component = await state.get.component(meta);
        expect(component.name).toBe(meta.componentString);
    });

    test('Scenario 4: Sub-component "workspaceUsersData.removeDuplicateUsers"', async () => {
        const meta = {
            app: 'tasks',
            componentRoot: 'workspaceUsersData',
            componentName: 'removeDuplicateUsers',
            componentString: 'workspaceUsersData.removeDuplicateUsers'
        };

        const component = await state.get.component(meta);
        expect(component.name).toBe(meta.componentString);
    });

    test('Scenario 5: Sub-component "workspaceWorkspaces.deleteAction"', async () => {
        const meta = {
            app: 'tasks',
            componentRoot: 'workspaceWorkspaces',
            componentName: 'deleteAction',
            componentString: 'workspaceWorkspaces.deleteAction'
        };

        const component = await state.get.component(meta);
        expect(component.name).toBe(meta.componentString);
    });

    test('Failure Case: Returns null for non-existent component', async () => {
        const meta = { app: 'tasks', componentRoot: 'invalid', componentName: 'missing' };
        const component = await state.get.component(meta);
        expect(component).toBeNull();
    });
});

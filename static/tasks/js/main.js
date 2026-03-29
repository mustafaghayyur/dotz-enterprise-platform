import $A from './helper.js';
import { Main } from '../../core/js/app.js';

/**
 * Begin Tasks Application
 */
Main(async () => {
    // fetch fields for Tasks app and save to memory
    $A.fetch.body(
        $A.fetch.route('api.settings.mappers', 'tata'), 
        'authenticationResponse', {}, 
        (data, containerId) => {
            $A.app.memSave('o2oTaskFields', $A.generic.getter(data, 'o2oFields'));
            $A.app.memSave('allTaskFields', $A.generic.getter(data, 'allFields'));
    });

    $A.fetch.body(
        $A.fetch.route('api.settings.mappers', 'wowo'), 
        'authenticationResponse', {}, 
        (data, containerId) => {
            $A.app.memSave('o2oWorkSpaceFields', $A.generic.getter(data, 'o2oFields'));
            $A.app.memSave('allWorkSpaceFields', $A.generic.getter(data, 'allFields'));
    });

    $A.dashboard('tasksDashboard', {
        // 'Personal' tab of the tasks dashboard:
        personal: async () => {
            $A.state.save('personalTodos', 'tasks.dashboardTodoList');
            //$A.state.save('personalAssignedTasks', 'tasks.dashboardAssignedTaskList');
            $A.state.trigger('personalTodos');
            //$A.state.trigger('personalAssignedTasks');            
        },

        // 'Workspaces' tab of tasks dashboard:
        workspaces: async () => {
            fetchWorkspacesDashboard('workspacesDashboardResponse', 'ws_workspaces');
        },
    }); /** end of tasks-dashboard */
    
    const rightSideCanvas = await $A.tasks.load('rightSideCanvas');
    rightSideCanvas();

    const taskDetailsWindow = await $A.tasks.load('taskDetailsView');

    // Allow opening of task-modals from url:
    $A.router.create(
        'task_id', 
        'taskDetailsModalResponse', 
        'taskDetailsModal', 
        taskDetailsWindow
    );
});

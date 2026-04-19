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
            $A.app.memSave('o2oTaskFields', $A.base.getter(data, 'o2oFields'));
            $A.app.memSave('allTaskFields', $A.base.getter(data, 'allFields'));
    });

    $A.fetch.body(
        $A.fetch.route('api.settings.mappers', 'wowo'), 
        'authenticationResponse', {}, 
        (data, containerId) => {
            $A.app.memSave('o2oWorkSpaceFields', $A.base.getter(data, 'o2oFields'));
            $A.app.memSave('allWorkSpaceFields', $A.base.getter(data, 'allFields'));
    });

    $A.dashboard('tasksDashboard', {
        // 'Personal' tab of the tasks dashboard:
        personal: async () => {
            await $A.state.call('dashboardTodoList', {'assignee_id': $A.app.memFetch('user', true).id});
            await $A.state.call('dashboardAssignedTaskList', {'assignee_id': $A.app.memFetch('user', true).id});      
        },

        // 'Workspaces' tab of tasks dashboard:
        workspaces: async () => {
            await $A.state.call('workspaceWorkspaces', {'user_id': $A.app.memFetch('user', true).id}); 
        },
    }, false); /** end of tasks-dashboard */
    
    let tasksComps = await $A.components('tasks');
    // Allow opening of task-modals from url:
    $A.router.create(
        'task_id', 
        'taskDetailsModalResponse', 
        'taskDetailsModal', 
        tasksComps.taskDetailsView.default.fetch,
    );
});

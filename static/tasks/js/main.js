import $A from './helper.js';
import { Main } from '../../core/js/app.js';
//import {fetchWorkspacesDashboard} from './crud/fetchDefault.js';
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
            let todos = $A.dom.obtainElementCorrectly('dashboardTodoList');
            $A.state.dom.addMapperArguments(todos, 'assignee_id', $A.app.memFetch('user', true).id);
            let assigned = $A.dom.obtainElementCorrectly('dashboardAssignedTaskList');
            $A.state.dom.addMapperArguments(assigned, 'assignee_id', $A.app.memFetch('user', true).id);        
        },

        // 'Workspaces' tab of tasks dashboard:
        workspaces: async () => {
            let workspaces = $A.dom.obtainElementCorrectly('workspaceWorkspaces');
            $A.state.dom.addMapperArguments(workspaces, 'user_id', $A.app.memFetch('user', true).id); 
        },
    }, false); /** end of tasks-dashboard */
    
    await $A.state.call('rightSideCanvas');
    let tasksComps = await $A.components('tasks');


    // Allow opening of task-modals from url:
    $A.router.create(
        'task_id', 
        'taskDetailsModalResponse', 
        'taskDetailsModal', 
        tasksComps.taskDetailsView.default.fetch,
    );
});

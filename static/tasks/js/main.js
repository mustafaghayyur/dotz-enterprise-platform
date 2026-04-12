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
            //const todos = await $A.state.save('personalTodos', 'tasks.["tata"].dashboardTodoList');
            //const tasks = await $A.state.save('personalAssignedTasks', 'tasks.["tata"].dashboardAssignedTaskList');
            //$A.state.trigger('personalTodos');
            //$A.state.trigger('personalAssignedTasks');            
        },

        // 'Workspaces' tab of tasks dashboard:
        workspaces: async () => {
            //$A.state.trigger('ws_workspaces');
        },
    }, false); /** end of tasks-dashboard */
    
    await $A.state.trigger('rightSideCanvas');


    // Allow opening of task-modals from url:
    $A.router.create(
        'task_id', 
        'taskDetailsModalResponse', 
        'taskDetailsModal', 
        await $A.state.trigger('taskDetailsView'),
    );
});

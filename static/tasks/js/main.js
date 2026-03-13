import $A from './helper.js';
import { Main } from '../../core/js/lib/app.js';

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

    $A.dashboard('tasksDashboard', {
        // 'Personal' tab of the tasks dashboard:
        personal: async () => {
            let request = null;
            const dashboardTodoList = await $A.tasks.load('dashboardTodoList');
            const dashboardTaskList = await $A.tasks.load('dashboardTaskList');

            $A.query().search('tata')
                .fields('tata_id', 'tast_id', 'description', 'tata_update_time', 'status')
                .where({
                    tata_delete_time: 'is Null',
                    assignee_id: $A.app.memFetch('user_id'),
                    visibility: 'private',
                })
                .order([
                    {tbl: 'tata', col: 'update_time', sort: 'desc'},
                    {tbl: 'tast', col: 'create_time', sort: 'desc'}
                ]).page(1)
                .execute('personalTabResponse', dashboardTodoList);

            $A.query().search('tata')
                .fields('tata_id', 'tast_id', 'description', 'tata_update_time', 'status', 'deadline')
                .where({
                    tata_delete_time: 'is Null',
                    assignee_id: $A.app.memFetch('user_id'),
                    workspace: null,
                    visibility: 'workspaces',
                    status: ['assigned', 'queued', 'started']
                })
                .order([{tbl: 'tata', col: 'create_time', sort: 'desc'}]).page(1)
                .execute('assignedTasksResponse', dashboardTaskList);
        },
        // 'Workspaces' tab of tasks dashboard:
        workspaces: async () => {
            console.log('We are initiating WorkSPace tab...');
            const workspaces = await $A.tasks.load('wp_workspaces');

            $A.query().search('wowo')
                .fields('wowo_id', 'name', 'description', 'type', 'creator', 'create_time')
                .where({
                    user_id: $A.app.memFetch('user_id'),
                    wowo_delete_time: 'is null',
                })
                .order([
                    {tbl: 'wowo', col: 'id', sort: 'desc'},
                ]).page(1).execute('workspacesDashboardResponse', workspaces);
        },
    });

    const cleanForms = await $A.tasks.load('cleanFormFunctionality'); 
    const taskDetailsWindow = await $A.tasks.load('taskDetails');
    const enableEditFunctionality = await $A.tasks.load('editTaskForm');
   
    cleanForms();    // load form clean functionality..
    enableEditFunctionality();  // we must now add edit functionality.

    // @todo: add this in appropriate form initiatior...
    //const loadTaskFormValues = await $A.tasks.load('loadTaskFormValues');
    //loadTaskFormValues(); // @todo: add appropriate workspace logic


    // Allow opening of task-modals from url:
    $A.router.create(
        'task_id', 
        'taskDetailsModalResponse', 
        'taskDetailsModal', 
        taskDetailsWindow
    );
});

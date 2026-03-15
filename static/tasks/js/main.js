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
                    status: ['created', 'assigned', 'started', 'awaitingfeedback']
                })
                .order([{tbl: 'tata', col: 'create_time', sort: 'desc'}]).page(1)
                .execute('assignedTasksResponse', dashboardTaskList);
        },

        // 'Workspaces' tab of tasks dashboard:
        workspaces: async () => {
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
    }); /** end of tasks-dashboard */
    
    const leftSideCanvas = await $A.tasks.load('leftSideCanvas');
    leftSideCanvas();

    const taskDetailsWindow = await $A.tasks.load('taskDetails');

    // Allow opening of task-modals from url:
    $A.router.create(
        'task_id', 
        'taskDetailsModalResponse', 
        'taskDetailsModal', 
        taskDetailsWindow
    );
});

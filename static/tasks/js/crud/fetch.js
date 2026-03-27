import $A from '../helper.js';

/**
 * Carries all Fetch requests in one place.
 */

export async function fetchTodosDashboard(containerId, componentName) {
    const component = await $A.tasks.load(componentName);

    $A.query().search('tata')
        .fields('tata_id', 'tast_id', 'description', 'tata_update_time', 'status')
        .where({
            tata_delete_time: 'is Null',
            assignee_id: $A.app.memFetch('user', true).id,
            visibility: 'private',
        })
        .order([
            {tbl: 'tata', col: 'update_time', sort: 'desc'},
            {tbl: 'tast', col: 'create_time', sort: 'desc'}
        ]).page(1)
        .execute(containerId, component);
}

export async function fetchAssignedTasksDashboard(containerId, componentName) {
    const component = await $A.tasks.load(componentName);
    
    $A.query().search('tata')
        .fields('tata_id', 'tast_id', 'description', 'tata_update_time', 'status', 'deadline')
        .where({
            tata_delete_time: 'is Null',
            assignee_id: $A.app.memFetch('user', true).id,
            workspace: null,
            visibility: 'workspaces',
            status: ['created', 'assigned', 'started', 'awaitingfeedback']
        })
        .order([{tbl: 'tata', col: 'create_time', sort: 'desc'}]).page(1)
        .execute(containerId, component);
}

export async function fetchWorkspacesDashboard(containerId, componentName) {
    const component = await $A.tasks.load(componentName);
    
    $A.query().search('wowo')
        .fields('wowo_id', 'name', 'description', 'type', 'creator', 'create_time')
        .where({
            user_id: $A.app.memFetch('user', true).id,
            wowo_delete_time: 'is null',
        })
        .order([
            {tbl: 'wowo', col: 'id', sort: 'desc'},
        ]).page(1).execute(containerId, component);
}

export async function fetchUserWatchStateForTask(task, containerId) {
    $A.query().read('tawa', {
            task_id: task.tata_id
        }).execute(containerId, (data, id) => {
        if ($A.generic.isVariableEmpty(data)) {
            watchbtn.classList.remove('d-none');
            unwatchbtn.classList.add('d-none');
        } else {
            unwatchbtn.classList.remove('d-none');
            watchbtn.classList.add('d-none');
        }
    });
}

/**
 * Retrieves & displays, task-level-comments..
 * @param {obj} task: task object
 */
export async function fetchTaskComments(task, containerId) {
    $A.query().read('taco', { task_id: task.tata_id })
        .execute(containerId, (comments, commentsContainerId) => {
            let commentsContainer = $A.dom.containerElement(commentsContainerId);
            let commentCreator = $A.dom.searchElementCorrectly('#createComment', commentsContainer);
            let comment = $A.dom.searchElementCorrectly('#commmentContainer', commentsContainer);
            
            commentsContainer.innerHTML = '';
            commentsContainer.appendChild(commentCreator);
            commentsContainer.appendChild(comment);

            if ($A.generic.checkVariableType(comments) === 'list') {
                comments.forEach(item => {
                    let newComment = $A.ui.embedData(item, comment.cloneNode(true), true);
                    const user = $A.app.user(item.commenter_id, commentsContainerId);
                    newComment.querySelector('.embed.creator_id').textContent = '' + user.username + ' wrote...';
                    newComment.classList.remove('d-none');
                    commentsContainer.appendChild(newComment);
                });
            }
        });
}

/**
 * Fetches all tasks for a specific WorkSpace. 
 * Arena view. Max 1000 recs.
 * @param {str} tabKey 
 * @param {obj} workSpaceInfo 
 */
export async function fetchTasksForWorkSpaceArena(tabKey, workSpaceInfo, containerId, componentName) {
    const component = await $A.tasks.load(componentName);

    $A.query().search('tata')
        .fields('tata_id', 'description', 'status', 'creator_id', 'assignee_id', 'deadline', 'tata_create_time')
        .where({
            workspace_id: workSpaceInfo.wowo_id,
            tata_delete_time: 'is null',
        }).order([
            {tbl: 'tata', col: 'id', sort: 'desc'},
        ]).page(1, 1000)
        .execute(containerId, component, {key: tabKey, data: workSpaceInfo});
}


export async function fetchDepartmentsForWorkSpace(containerId, componentName) {
    const component = await $A.tasks.load(componentName);
    
    $A.query().search('wode').fields('wode_id', 'dede_name')
        .join({'left|department_id': 'dede_id'})
        .where({'workspace_id': wowoData.wowo_id})
        .order([{tbl:'ded', col: 'dede_name', sort: 'desc'}])
        .execute(containerId, component);
}

export async function fetchUsersForDepartment(containerId, componentName) {
    const component = await $A.tasks.load(componentName);
    
    $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name'
        ).join({
            'left|usus_id': 'deus_user_id',
        }).where({
            deus_department_id: currentDepts,
            user_level: [10, 20, 30, 40, 50] // + $A.data.user.levels.leader // @todo: add gt/lt operators to conditions
        }).order([
            {tbl:'usus', col: 'last_name', sort: 'asc'},
            {tbl:'usus', col: 'first_name', sort: 'asc'}
        ]).page(1, 1000)
        .execute(containerId, component);
}


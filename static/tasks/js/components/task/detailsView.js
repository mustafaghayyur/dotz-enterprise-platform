import $A from "../../helper.js";

/**
 * Displays complete task record. With all functionality for that pane.
 * 
 * @param {object} task - retrieved from Fetcher() internal function fetchResource()
 * @param {string} containerId - html id for DOM element in which responses from Fetcher are auto-embedded
 */
export default {
    default: {
        fetch: function (mapper, containerId) {
            $A.query().read('tata', { tata_id: mapper.taskId })
                .execute(containerId, this, mapper);
        },
        name: 'taskDetailsView',
        mapper: ['taskId'],
        tbls: ['tata'],
        identifier: ['taskId'],

        component: async function (task, containerId) {
            let container = $A.dom.containerElement(containerId);
            
            if ($A.base.not(task, 'dictionary')) {
                throw Error('UI Error: Task object retrieved in Detail view not of dictionary type.');
            }
            
            container = $A.ui.embedData(task, container, true);
            const creator = $A.app.user(task.creator_id, containerId);
            const assignor = $A.app.user(task.assignor_id, containerId);
            const assignee = $A.app.user(task.assignee_id, containerId);
            $A.dom.searchElementCorrectly('.embed.creator_id', container).textContent = `${creator.first_name} ${creator.last_name}`;
            $A.dom.searchElementCorrectly('.embed.assignor_id', container).textContent = `${assignor.first_name} ${assignor.last_name}`;
            $A.dom.searchElementCorrectly('.embed.assignee_id', container).textContent = `${assignee.first_name} ${assignee.last_name}`;
            
            // add functionality on task-details modal...
            await $A.state.call('taskDetailsView.editAndDelete', task);
            await $A.state.call('taskDetailsView.userWatchState', { 'tata_id': task.tata_id });
            await $A.state.call('taskCreateComment', { 'tata_id': task.tata_id });
            await $A.state.call('taskComments', { 'tata_id': task.tata_id });
        }
    },

    /**
     * Enabled full edit/delete functionality on task item
     * @todo: research focus and JS interactions: https://reintech.io/blog/bootstrap-5-modals-tips-tricks#focus-management <- might help with duplicate modal dom events
     * 
     * @param {obj} task: API result set.
     */
    editAndDelete: {
        name: 'taskDetailsView.editAndDelete',
        mapper: [],
        cache: false,

        component: async function (data, containerId, task) {
            const container = $A.dom.containerElement(containerId);
            const editBtn = document.getElementById('editTaskBtn');
            $A.state.dom.addMapperArguments(editBtn, 'task-data', task);
            
            $A.state.events.eventListener('click', editBtn, async (e) => {
                const taskRec = e.currentTarget.dataset.stateMapperTaskData;
                await $A.state.call('taskEditForm', $A.base.parse(taskRec));
            });

            const deleteBtn = document.getElementById('deleteTaskBtn');
            $A.state.dom.addMapperArguments(deleteBtn, 'task-id', task.tata_id);
            
            $A.state.events.eventListener('click', deleteBtn, (e) => {
                e.preventDefault();
                const taskId = e.currentTarget.dataset.stateMapperTaskId;
                $A.state.dom.addMapperArguments(container, 'identifier-string', 'Task with id #' + taskId); 
                $A.state.dom.addMapperArguments(container, 'confirm-message', `The Task record with id #${taskId} has been archived without errors.`); 

                $A.state.crud.delete('tata', { 'task_id': taskId }, container);
            });
        }
    },


    /**
     * Handles current state of user watching task
     * 
     * @param {arr} data: api data 
     * @param {str} containerId 
     */
    userWatchState: {
        fetch: function (mapper, containerId) {
            $A.query().read('tawa', {
                task_id: mapper.tata_id
            }).execute(containerId, this, mapper);
        },
        name: 'taskDetailsView.userWatchState',
        mapper: ['tata_id'],
        tbls: ['tawa'],
        identifier: ['tata_id'],

        component: function(data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let watchBtn = $A.dom.searchElementCorrectly('#addWatcher', container);
            let unwatchBtn = $A.dom.searchElementCorrectly('#removeWatcher', container);

            if ($A.base.empty(data)) {
                watchBtn.classList.remove('d-none');
                unwatchBtn.classList.add('d-none');
            } else {
                unwatchBtn.classList.remove('d-none');
                watchBtn.classList.add('d-none');
            }

            $A.state.dom.addMapperArguments(watchBtn, 'task-id', data.task_id);
            $A.state.dom.addMapperArguments(unwatchBtn, 'task-id', data.task_id);

            // add event listeners of watch buttons...
            $A.app.eventListener('click', watchBtn, async (e) => {
                e.preventDefault();
                const taskId = e.currentTarget.dataset.stateMapperTaskId;
                $A.state.crud.create('tawa', { task_id: taskId }, container, (resp, conId) => {
                    watchBtn.classList.add('d-none');
                    unwatchBtn.classList.remove('d-none');
                    $A.app.generateResponseToAction(conId, 'Added to watcher list.');
                });
            });

            $A.app.eventListener('click', unwatchBtn, async (e) => {
                e.preventDefault();
                const taskId = e.currentTarget.dataset.stateMapperTaskId;
                $A.state.crud.delete('tawa', { task_id: taskId }, container, (resp, conId) => {
                    watchBtn.classList.remove('d-none');
                    unwatchBtn.classList.add('d-none');
                    $A.app.generateResponseToAction(containerId, 'Removed from watcher list.');
                });
            });
        }
    },
}

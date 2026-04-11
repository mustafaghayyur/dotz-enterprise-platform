import { removeWatcher, createWatcher } from "../../crud/watchers.js";
import { DeleteTask } from '../../crud/tasks.js';
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
            $A.query().read('tata', { tata_id: mapper.taskId }).execute(containerId, this.component);
        },
        name: 'taskDetailsView',
        tbls: ['tata'],
        identifier: ['taskId'],

        component: function (task, containerId) {
            let container = $A.dom.containerElement(containerId);
            
            if ($A.generic.checkVariableType(task) !== 'dictionary') {
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
            editAndDelete(task);
            $A.state.trigger('taskUserWatchState', { 'tata_id': task.tata_id }, false);
            $A.state.trigger('taskCreateComment', { 'tata_id': task.tata_id });
            $A.state.trigger('taskComments', { 'tata_id': task.tata_id }, false);
        }
    },

    /**
     * Enabled full edit/delete functionality on task item
     * @todo: research focus and JS interactions: https://reintech.io/blog/bootstrap-5-modals-tips-tricks#focus-management <- might help with duplicate modal dom events
     * 
     * @param {obj} task: API result set.
     */
    editAndDelete: {
        fetch: function (task, containerId) {
            this.component({}, containerId, task);
        },

        name: 'taskDetailsView.editAndDelete',
        cache: false,

        component: async function (data, containerId, task) {
            const container = $A.dom.containerElement(containerId);
            const editBtn = document.getElementById('editTaskBtn');
            $A.state.dom.addMapperArguments(editBtn, 'task-data', task);
            
            $A.state.dom.eventListener('click', editBtn, async (e) => {
                const taskRec = e.currentTarget.dataset.stateMapperTaskData;
                $A.state.trigger('taskEditForm', $A.generic.parse(taskRec));
            });

            const deleteBtn = document.getElementById('deleteTaskBtn');
            $A.state.dom.addMapperArguments(deleteBtn, 'task-id', task.tata_id);
            
            $A.state.dom.eventListener('click', deleteBtn, (e) => {
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
            }).execute(containerId, this.component);
        },
        tbls: ['tawa'],
        identifier: ['tata_id'],

        component: function(data, containerId) {
            let constainer = $A.dom.containerElement(containerId);
            let watchBtn = $A.dom.seachElementCorrectly('addWatcher', constainer);
            let unwatchBtn = $A.dom.seachElementCorrectly('removeWatcher', constainer);

            if ($A.generic.isVariableEmpty(data)) {
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

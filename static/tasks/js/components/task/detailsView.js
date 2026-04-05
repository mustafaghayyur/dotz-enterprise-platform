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
    fetch: {
        default: function (mapper, containerId, componentName) {
            // fetch logic will be added here
        }
    },

    component: {
        default: function (task, containerId) {
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
            
            
            /**
             * Enabled full edit/delete functionality on task item
             * @todo: research focus and JS interactions: https://reintech.io/blog/bootstrap-5-modals-tips-tricks#focus-management <- might help with duplicate modal dom events
             * 
             * @param {obj} task: API result set.
             */
            async function editAndDelete(task) {
                const editBtn = document.getElementById('editTaskBtn');
                $A.state.dom.addMapperArguments(editBtn, 'task-data', task);
                
                $A.state.dom.eventListener('click', editBtn, async (e) => {
                    const taskRec = e.currentTarget.dataset.stateMapperTaskData;
                    const taskEditForm = await $A.tasks.load('task.editForm');
                    taskEditForm($A.generic.parse(taskRec));
                });

                const deleteBtn = document.getElementById('deleteTaskBtn');
                $A.state.dom.addMapperArguments(deleteBtn, 'task-id', task.tata_id);
                
                $A.state.dom.eventListener('click', deleteBtn, (e) => {
                    e.preventDefault();
                    const taskId = e.currentTarget.dataset.stateMapperTaskId;
                    $A.state.dom.addMapperArguments(container, 'confirm-message', 'Task with id #' + taskId); 
                    $A.state.dom.addMapperArguments(container, 'identifier-string', `The Task record with id #${taskId} has been archived without errors.`); 

                    $A.state.crud.delete('tata', { 'task_id': taskId }, container);
                });
            }
        }
    }
}

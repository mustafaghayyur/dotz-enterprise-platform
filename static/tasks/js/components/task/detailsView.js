import { removeWatcher, createWatcher } from "../../crud/watchers.js";
import { createCommentForTask } from "../../crud/comments.js";
import { DeleteTask } from '../../crud/tasks.js';
import $A from "../../helper.js";

/**
 * Displays complete task record. With all functionality for that pane.
 * 
 * @param {object} task - retrieved from Fetcher() internal function fetchResource()
 * @param {string} containerId - html id for DOM element in which responses from Fetcher are auto-embedded
 */
export default function (task, containerId) {
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
    newComments(task);
    $A.state.trigger('taskComments', { 'tata_id': task.tata_id }, false);
    
    
    /**
     * Enabled full edit/delete functionality on task item
     * @todo: research focus and JS interactions: https://reintech.io/blog/bootstrap-5-modals-tips-tricks#focus-management <- might help with duplicate modal dom events
     * 
     * @param {obj} task: API result set.
     */
    async function editAndDelete(task) {
        const editBtn = document.getElementById('editTaskBtn');
        const newData = { 
            idString: 'Task with id #' + taskId, 
            confirm: `The Task record with id #${taskId} has been archived without errors.` 
        };
        const editData = $A.generic.merge(newData, task);
        $A.state.dom.eventListener('click', editBtn, async (e) => {
            const raw = e.currentTarget.getAttribute('data-state-listener-data');
            const taskEditForm = await $A.tasks.load('task.editForm');
            taskEditForm($A.generic.parse(raw));
        }, $A.generic.stringify(editData));

        const deleteBtn = document.getElementById('deleteTaskBtn');
        const delData = { 
            'tata_id': task.tata_id, 
            idString: 'Task with id #' + taskId, 
            confirm: `The Task record with id #${taskId} has been archived without errors.` 
        };
        $A.state.dom.eventListener('click', deleteBtn, (e) => {
            e.preventDefault();
            const raw = e.currentTarget.getAttribute('data-state-listener-data');
            $A.state.crud.delete('tata', $A.generic.parse(raw), container);
        }, $A.generic.stringify(delData));
    }

    /**
     * implement rich-text editor and comments form.
     * @param {obj} task 
     */
    function newComments(task) {
        $A.editor.make('commentEditor');
        let saveCommentBtn = document.getElementById('saveComment');
        saveCommentBtn.setAttribute('data-task-id', task.tata_id);
        
        $A.app.wrapEventListeners(saveCommentBtn, 'data-task-id', task.tata_id, 'click', (e) => {
            e.preventDefault();
            let editor = document.querySelector('#newCommentForm #commentEditor');
            let hiddenCommentInput = document.querySelector('#newCommentForm #' + editor.dataset.fieldId);
            hiddenCommentInput.value = editor.innerHTML;
            let taskIdField = document.querySelector('#newCommentForm #task_id');
            taskIdField.value = e.currentTarget.getAttribute('data-task-id');
            createCommentForTask('newCommentForm');
        });
    }
}

/**
 * @todo: implement this project-wide somehow.
 * 
 * > also look into: show.bs.modal event combined with event.relatedTarget
 * 
 * Cleaning up after model-hide:
 * const modalElement = document.getElementById('tempModal');

    modalElement.addEventListener('hidden.bs.modal', function() {
    // Dispose of Bootstrap instance
    const modalInstance = bootstrap.Modal.getInstance(this);
    if (modalInstance) {
        modalInstance.dispose();
    }
    
    // Remove from DOM if it was dynamically created
    if (this.dataset.temporary === 'true') {
        this.remove();
    }
    });
 */

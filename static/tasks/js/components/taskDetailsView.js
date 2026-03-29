import { removeWatcher, createWatcher } from "../crud/watchers.js";
import { createCommentForTask } from "../crud/comments.js";
import { DeleteTask } from '../crud/tasks.js';
import { fetchUserWatchStateForTask, fetchTaskComments } from '../crud/fetchDefault.js';
import $A from "../helper.js";

/**
 * Displays complete task record. With all functionality for that pane.
 * 
 * @param {object} task - retrieved from Fetcher() internal function fetchResource()
 * @param {string} containerId - html id for DOM element in which responses from Fetcher are auto-embedded
 */
export default function (task, containerId) {
    let container = $A.dom.containerElement(containerId);
    
    const dataType = $A.generic.checkVariableType(task);
    if (dataType !== 'dictionary') {
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
    assignments(task);
    newComments(task);
    fetchTaskComments(task, 'commentsResponse');
    
    
    /**
     * Enabled full edit/delete functionality on task item
     * @todo: research focus and JS interactions: https://reintech.io/blog/bootstrap-5-modals-tips-tricks#focus-management <- might help with duplicate modal dom events
     * 
     * @param {obj} task: API result set.
     */
    async function editAndDelete(task) {
        const editBtn = document.getElementById('editTaskBtn');
        $A.app.wrapEventListeners(editBtn, 'data-task', JSON.stringify(task), 'click', async (e) => {
            const taskData = JSON.parse(e.currentTarget.getAttribute('data-task'));
            const taskEditForm = await $A.tasks.load('taskEditForm');
            taskEditForm(taskData);
        });

        const deleteBtn = document.getElementById('deleteTaskBtn');
        $A.app.wrapEventListeners(deleteBtn, 'data-task-id', task.tata_id, 'click', (e) => {
            e.preventDefault();
            const taskId = e.currentTarget.getAttribute('data-task-id');
            DeleteTask(taskId, 'Task with id #' + taskId);
        });
    }

    /**
     * add (un)watcher button(s)
     * @param {obj} task 
     */
    function assignments(task) {
        let watchbtn = document.getElementById('addWatcher');
        let unwatchbtn = document.getElementById('removeWatcher');

        // add event listeners of watch buttons...
        $A.app.wrapEventListeners(watchbtn, 'data-task-id', task.tata_id, 'click', async (e) => {
            e.preventDefault();
            const taskId = e.currentTarget.getAttribute('data-task-id');
            createWatcher(taskId, 'addWatcher', 'removeWatcher');
        });

        $A.app.wrapEventListeners(unwatchbtn, 'data-task-id', task.tata_id, 'click', async (e) => {
            e.preventDefault();
            const taskId = e.currentTarget.getAttribute('data-task-id');
            removeWatcher(taskId, 'addWatcher', 'removeWatcher');
        });

        // fetch current watch state for user
        fetchUserWatchStateForTask(task, watchbtn, unwatchbtn, 'taskDetailsModalResponse');
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

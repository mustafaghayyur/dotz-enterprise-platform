import { removeWatcher, createWatcher } from "../crud/watchers.js";
import { createCommentForTask } from "../crud/comments.js";
import { DeleteTask } from '../crud/tasks.js';
import $A from "../helper.js";

/**
 * Displays complete task record. With all functionality for that pane.
 * 
 * @param {object} task - retrieved from Fetcher() internal function fetchResource()
 * @param {string} containerId - html id for DOM element in which responses from Fetcher are auto-embedded
 */
export default function (task, containerId) {
    let container = $A.app.containerElement(containerId);
    
    const dataType = $A.generic.checkVariableType(task);
    if (dataType !== 'dictionary') {
        throw Error('UI Error: Task object retrieved in Detail view not of dictionary type.');
    }
    
    container = $A.app.embedData(task, container, true);
    const creator = $A.app.user(task.creator_id, containerId);
    const assignor = $A.app.user(task.assignor_id, containerId);
    const assignee = $A.app.user(task.assignee_id, containerId);
    $A.app.searchElementCorrectly('.embed.creator_id', container).textContent = `${creator.first_name} ${creator.last_name}`;
    $A.app.searchElementCorrectly('.embed.assignor_id', container).textContent = `${assignor.first_name} ${assignor.last_name}`;
    $A.app.searchElementCorrectly('.embed.assignee_id', container).textContent = `${assignee.first_name} ${assignee.last_name}`;
    
    // add functionality on task-details modal...
    editAndDelete(task);
    assignments(task);
    newComments(task);
    viewComments(task);
    
    
    /**
     * Enabled full edit/delete functionality on task item
     * @param {obj} task: API result set.
     */
    async function editAndDelete(task) {
        const editBtn = document.getElementById('editTaskBtn');
        const deleteBtn = document.getElementById('deleteTaskBtn');

        editBtn.setAttribute('data-task', JSON.stringify(task));
        deleteBtn.setAttribute('data-task-id', task.tata_id);

        if (!editBtn.hasEditListener) {
            editBtn.addEventListener('click', async function() {
                const taskData = JSON.parse(this.getAttribute('data-task'));
                $A.tasks.forms.prefillEditForm(taskData, TasksO2OKeys);
                const taskEditForm = await $A.tasks.load('taskEditForm');
                taskEditForm(taskData);
            });
            editBtn.hasEditListener = true;
        }

        if (!deleteBtn.hasDeleteListener) {
            deleteBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const taskId = this.getAttribute('data-task-id');
                DeleteTask(taskId, 'Task with id #' + taskId);
            });
            deleteBtn.hasDeleteListener = true;
        }
    }

    /**
     * add (un)watcher button(s)
     * @param {obj} task 
     */
    function assignments(task) {
        let watchbtn = document.getElementById('addWatcher');
        let unwatchbtn = document.getElementById('removeWatcher');
        $A.query()
            .read('tawa', {
                    task_id: task.tata_id
                })
            .execute('taskDetailsModalResponse', (data, id) => {
                if ($A.generic.isVariableEmpty(data)) {
                    watchbtn.classList.remove('d-none');
                    unwatchbtn.classList.add('d-none');
                } else {
                    unwatchbtn.classList.remove('d-none');
                    watchbtn.classList.add('d-none');
                }
            });

        watchbtn.setAttribute('data-task-id', task.tata_id);
        unwatchbtn.setAttribute('data-task-id', task.tata_id);

        if (!watchbtn.hasWatchListener) {
            watchbtn.addEventListener('click', (e) => {
                e.preventDefault();
                const taskId = e.target.getAttribute('data-task-id');
                createWatcher(taskId, 'addWatcher', 'removeWatcher');
            });
            watchbtn.hasWatchListener = true;
        }

        if (!unwatchbtn.hasUnwatchListener) {
            unwatchbtn.addEventListener('click', (e) => {
                e.preventDefault();
                const taskId = e.target.getAttribute('data-task-id');
                removeWatcher(taskId, 'addWatcher', 'removeWatcher');
            });
            unwatchbtn.hasUnwatchListener = true;
        }
    }

    /**
     * implement rich-text editor and comments form.
     * @param {obj} task 
     */
    function newComments(task) {
        $A.editor.make('commentEditor');
        let saveCommentBtn = document.getElementById('saveComment');
        saveCommentBtn.setAttribute('data-task-id', task.tata_id);
        if (!saveCommentBtn.hasSaveListener) {
            saveCommentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let editor = document.querySelector('#newCommentForm #commentEditor');
                let hiddenCommentInput = document.querySelector('#newCommentForm #' + editor.dataset.fieldId);
                hiddenCommentInput.value = editor.innerHTML;
                let taskIdField = document.querySelector('#newCommentForm #task_id');
                taskIdField.value = e.target.getAttribute('data-task-id');
                createCommentForTask('newCommentForm');
            });
            saveCommentBtn.hasSaveListener = true;
        }
    }

    /**
     * Retrieves & displays, task-level-comments..
     * @param {obj} task: task object
     */
    async function viewComments(task) {
        $A.query().read('taco', { task_id: task.tata_id })
            .execute('commentsResponse', (comments, commentsContainerId) => {
                let commentsContainer = $A.app.containerElement(commentsContainerId);
                let commentCreator = $A.app.searchElementCorrectly('#createComment', commentsContainer);
                let comment = $A.app.searchElementCorrectly('#commmentContainer', commentsContainer);
                
                commentsContainer.innerHTML = '';
                commentsContainer.appendChild(commentCreator);
                commentsContainer.appendChild(comment);

                if ($A.generic.checkVariableType(comments) === 'list') {
                    comments.forEach(item => {
                        let newComment = $A.app.embedData(item, comment.cloneNode(true), true);
                        const user = $A.app.user(item.commenter_id, commentsContainerId);

                        newComment.classList.remove('d-none');
                        newComment.querySelector('.embed.creator_id').textContent = '' + user.username + ' wrote...';
                        commentsContainer.appendChild(newComment);
                    });
                }
            });
    }
}

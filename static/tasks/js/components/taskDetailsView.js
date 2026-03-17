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
    const conatiner = $A.app.containerElement(containerId);
    $A.app.embedData(task, conatiner, true);
    
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
        let editBtn = document.getElementById('editTaskBtn');

        editBtn.addEventListener('click', async () => {
            $A.tasks.forms.prefillEditForm(task, TasksO2OKeys);
            const editForm = await $A.tasks.load('taskEditForm');
            taskEditForm(task);
        });

        // add delete button functionality
        const deleteBtn = document.getElementById('deleteTaskBtn');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            DeleteTask(task.tata_id, 'Task with id #' + task.tata_id);
        });
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

        watchbtn.addEventListener('click', (e) => {
            e.preventDefault();
            createWatcher(task.tata_id, 'addWatcher', 'removeWatcher');
        });
        unwatchbtn.addEventListener('click', (e) => {
            e.preventDefault();
            removeWatcher(task.tata_id, 'addWatcher', 'removeWatcher');
        });
    }

    /**
     * implement rich-text editor and comments form.
     * @param {obj} task 
     */
    function newComments(task) {
        $A.editor.make('commentEditor');
        let saveCommentBtn = document.getElementById('saveComment');
        saveCommentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let editor = document.querySelector('#newCommentForm #commentEditor');
            let hiddenCommentInput = document.querySelector('#newCommentForm #' + editor.dataset.fieldId);
            hiddenCommentInput.value = editor.innerHTML;
            let taskIdField = document.querySelector('#newCommentForm #task_id');
            taskIdField.value = task.tata_id;
            createCommentForTask('newCommentForm');
        });
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

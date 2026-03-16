import { removeWatcher, createWatcher } from "../crud/watchers.js";
import { createCommentForTask } from "../crud/comments.js";
import { DeleteTask } from '../crud/tasks.js';
import $A from "../helper.js";

/**
 * This mapper function only finds dom elements matching items in the 'TasksO2OKeys' list, if task has the key
 * as well, then subs the task.key into the HTML of the matching dom elememnt.
 * 
 * containerId is irrelevent in this mapper. This is a callback function passed to Fetcher()
 * 
 * @param {object} task - retrieved from Fetcher() internal function fetchResource()
 * @param {string} containerId - html id for DOM element in which responses from Fetcher are auto-embedded
 */
export default function (task, containerId) {
    const TasksO2OKeys = $A.app.memFetch('o2oTaskFields', true);
    TasksO2OKeys.forEach(key => {
        let fieldContainer = document.getElementById(key);

        if (fieldContainer instanceof HTMLElement) {
            let data = $A.generic.getter(task, key, undefined);
            let item = $A.generic.formatValueToString(data);

            if (item && (item.startsWith('{') || item.startsWith('['))) {
                let pre = $A.app.makeDomElement('pre', 'm-1');
                pre.textContent = $A.forms.escapeHtml(item);
                fieldContainer.appendChild(pre);
                return;
            }
            fieldContainer.textContent = $A.forms.escapeHtml(item);
        }
    });

    // add functionality on task-details modal...
    editAndDeleteFunction(task);
    assignmentsFunction(task);
    newCommentsFunction(task);
    viewCommentsFunction(task);
    
    
    /**
     * Enabled full edit/delete functionality on task item
     * @param {obj} task: API result set.
     */
    async function editAndDeleteFunction(task) {
        let editBtn = document.getElementById('editTaskBtn');

        editBtn.addEventListener('click', async () => {
            $A.tasks.forms.prefillEditForm(task, TasksO2OKeys);
            const editForm = await $A.tasks.load('taskEditForm');
            editForm(task);
        });

        // add delete button functionality
        const deleteBtn = document.getElementById('deleteTaskBtn');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            DeleteTask(task.tata_id);
        });

        const enableEditFunctionality = await $A.tasks.load('editTaskForm');
        enableEditFunctionality();
    }

    /**
     * add (un)watcher button(s)
     * @param {obj} task 
     */
    function assignmentsFunction(task) {
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
    function newCommentsFunction(task) {
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
    async function viewCommentsFunction(task) {
        $A.query().read('taco', { task_id: task.tata_id })
            .execute('commentsResponse', (comments, containerId) => {
                let container = $A.app.containerElement(containerId);
                let commentCreator = $A.app.searchElementCorrectly('#createComment', container);
                let comment = $A.app.searchElementCorrectly('#commmentContainer', container);
                
                container.innerHTML = '';
                container.appendChild(commentCreator);

                if ($A.generic.checkVariableType(comments) === 'list') {
                    comments.forEach(item => {
                        let newComment = $A.app.embedData(item, comment.cloneNode(true), true);
                        const user = $A.app.user(item.commenter_id, containerId);

                        newComment.classList.remove('d-none');
                        newComment.querySelector('.embed.creator_id').textContent = '' + user.username + ' wrote...';
                        container.appendChild(newComment);
                    });
                }
            });
    }
}

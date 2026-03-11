import { removeWatcher, createWatcher } from "../crud/watchers.js";
import { createCommentForTask } from "../crud/comments.js";
import { DeleteTask } from '../crud/tasks.js';
import $A from "../helper.js";

/**
 * This mapper function only finds dom elements matching items in the 'TasksO2OKeys' list, if resultSet has the key
 * as well, then subs the resultSet[key] into the HTML of the matching dom elememnt.
 * 
 * containerId is irrelevent in this mapper. This is a callback function passed to Fetcher()
 * 
 * @param {object} resultSet - retrieved from Fetcher() internal function fetchResource()
 * @param {string} containerId - html id for DOM element in which responses from Fetcher are auto-embedded
 */
export default function (resultSet, containerId) {
    const TasksO2OKeys = $A.app.memFetch('o2oTaskFields', true);
    TasksO2OKeys.forEach(key => {
        let fieldContainer = document.getElementById(key);

        if (fieldContainer instanceof HTMLElement) {
            let data = $A.generic.getter(resultSet, key, undefined);
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
    editAndDeleteFunction(resultSet);
    assignmentsFunction(resultSet);
    newCommentsFunction(resultSet);
    viewCommentsFunction(resultSet);
    
    
    /**
     * add edit button
     * @param {obj} resultSet 
     */
    async function editAndDeleteFunction(resultSet) {
        let editBtn = document.getElementById('editTaskBtn');
        const loadTaskFormValues = await $A.tasks.load('loadTaskFormValues');
        editBtn.addEventListener('click', () => {
            $A.tasks.forms.prefillEditForm(resultSet, TasksO2OKeys);
            loadTaskFormValues(resultSet);
        });

        // add delete button functionality
        const deleteBtn = document.getElementById('deleteTaskBtn');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            DeleteTask(resultSet['tata_id']);
        });
    }

    /**
     * add (un)watcher button(s)
     * @param {obj} resultSet 
     */
    function assignmentsFunction(resultSet) {
        let watchbtn = document.getElementById('addWatcher');
        let unwatchbtn = document.getElementById('removeWatcher');
        $A.query()
            .read('tawa', {
                    task_id: resultSet['tata_id']
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
            createWatcher(resultSet['tata_id'], 'addWatcher', 'removeWatcher');
        });
        unwatchbtn.addEventListener('click', (e) => {
            e.preventDefault();
            removeWatcher(resultSet['tata_id'], 'addWatcher', 'removeWatcher');
        });
    }

    /**
     * implement rich-text editor and comments form.
     * @param {obj} resultSet 
     */
    function newCommentsFunction(resultSet) {
        $A.editor.make('commentEditor');
        let saveCommentBtn = document.getElementById('saveComment');
        saveCommentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let editor = document.querySelector('#newCommentForm #commentEditor');
            let hiddenCommentInput = document.querySelector('#newCommentForm #' + editor.dataset.fieldId);
            hiddenCommentInput.value = editor.innerHTML;
            let taskIdField = document.querySelector('#newCommentForm #task_id');
            taskIdField.value = resultSet['tata_id'];
            createCommentForTask('newCommentForm');
        });
    }

    /**
     * retrieves task-level-comments..
     * @param {obj} resultSet 
     */
    async function viewCommentsFunction(resultSet) {
        const callback = await $A.tasks.load('commentsList');
        $A.query().read('taco', {
                    task_id: resultSet['tata_id']
                }).execute('commentsResponse', callback);
    }
}

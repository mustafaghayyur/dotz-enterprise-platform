import { toggleTodoStatus, deleteTodo } from '../crud/tasks.js';
import $A from "../helper.js";

/**
 * Maps fetched ToDos to page elements.
 * 
 * @param {obj} data: results object from Fetcher call
 * @param {str} containerId: Id of the container to show any error messages.
 */
export default function (data, containerId) {
    let ul = $A.dom.containerElement(containerId);
    let originalLiItem = $A.dom.searchElementCorrectly('li.list-group-item', ul);
    ul.innerHTML = '';

    const toDos = sortToDoRecords(data);

    toDos.forEach(item => {
        let li = originalLiItem.cloneNode(true);
        let status = li.querySelector('.status').querySelector('.' + item.status);
        let desc = li.querySelector('.description');
        desc.dataset.taskId = $A.forms.escapeHtml(item.tata_id);
        desc.textContent = $A.forms.escapeHtml(item.description);
        
        if (item.status === 'completed') {
            desc.classList.add('text-decoration-line-through');
        }
        if (status instanceof HTMLElement) {
            status.classList.remove('d-none');
        }
        
        li.querySelector('.status').addEventListener('click', () => { toggleTodoStatus(item); });
        li.querySelector('.delete').addEventListener('click', () => { deleteTodo(item.tata_id, item.description); });

        ul.appendChild(li);
    });

    $A.app.initializeTooltips(ul, false); // initialize tooltips

    /**
     * Sorts ToDo records based on assigned first, then completed.
     * 
     * @param {arr} data: list of Todo (task) records supplied by API
     */
    function sortToDoRecords(data) {
        if($A.generic.checkVariableType(data) !== 'list'){
            throw Error('Data Error: Could not fetch ToDo records in array format.');
        }
        
        // Separate records by status, maintaining original order within each group
        const assigned = data.filter(item => item.status === 'assigned');
        const completed = data.filter(item => item.status === 'completed');
        
        // Return assigned first, then completed
        return [...assigned, ...completed];
    }
}
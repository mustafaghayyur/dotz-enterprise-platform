import { toggleTodoStatus, deleteTodo } from '../crud/tasks.js';
import $A from "../helper.js";

/**
 * Callback function for Fetcher() that maps fetched ToDos to page elemments.
 * @param {obj} data: results object from Fetcher call
 * @param {str} containerId: Id of the container to show any error messages.
 */
export default function (data, containerId) {
    // I want to take the value held in containerId, and replace 'Responses' with List to get the ul id.
    // @todo: change containerId referencing to w/o 'Response' and make all hard-coded child-references go-away
    const ulId = containerId.replace(/Response$/,'');
    let ul = document.getElementById(ulId); // should be the ul parent node.
    let originalLiItem = ul.querySelector('li.list-group-item');
    ul.innerHTML = '';
    let li = null;

    if (Array.isArray(data)) {
        data.forEach(item => {
            li = originalLiItem.cloneNode(true);
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
    } else {
        originalLiItem.innerHTML = '<pre>' + $A.forms.escapeHtml(JSON.stringify(data, null, 2)) + '</pre>';
        container.appendChild(originalLiItem);
    }
}
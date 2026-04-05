import $A from "../helper.js";

/**
 * Maps retieved user's tasks to page elements.
 * 
 * @param {obj} data: results object from Fetcher call
 * @param {str} containerId: Id of the container to show any error messages.
 */
export default {
    fetch: {
        default: function (mapper, containerId, componentName) {
            // fetch logic will be added here
        }
    },

    component: {
        default: function (data, containerId) {
            const container = $A.dom.containerElement(containerId);
            let ul = $A.dom.searchElementCorrectly('ul.list-group', container);
            let originalLiItem = $A.dom.searchElementCorrectly('li.list-group-item', ul);

            $A.ui.handleEmptyData(data, ul);

            data.forEach(item => {
                let li = originalLiItem.cloneNode(true);
                li.classList.remove('d-none');
                li.querySelector('.description').dataset.taskId = $A.forms.escapeHtml(item.tata_id);
                li.querySelector('.description').textContent = item.description || JSON.stringify(item);
                li.querySelector('.status').textContent = $A.forms.escapeHtml(item.status);
                li.querySelector('.tata_update_time').textContent = $A.dates.convertToDisplayLocal(item.tata_update_time);
                li.querySelector('.deadline').textContent = $A.dates.convertToDisplayLocal(item.deadline);
                ul.appendChild(li);
            });

            addListenersToTasks(ul);

            /**
             * Adds read functionality to each fetched task.
             * Adds event listeners to the fetched tasks, allowing
             * for Task Details Modal to become operational on them.
             * @param {domelement} container - passed by TabbedDashBoard()
             */
            async function addListenersToTasks(container){
                if(container instanceof HTMLElement){
                    // implment listener and fetcher for item details modal...
                    let tasks = container.querySelectorAll('.task-details-link');
                    tasks.forEach(task => {
                        let id = task.dataset.taskId;
                        task.addEventListener('click', ()=>{
                            $A.state.trigger('taskDetailsView');
                            $A.router.update('task_id', id);
                        });
                    });
                }
            }
        }
    }
}

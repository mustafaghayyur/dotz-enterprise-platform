import $A from "../helper.js";

/**
 * Maps retieved user's tasks to page elements.
 * 
 * @param {obj} data: results object from Fetcher call
 * @param {str} containerId: Id of the container to show any error messages.
 */
export default {
    default: {
        // mapper.assignee_id = $A.app.memFetch('user', true).id
        fetch: function (mapper, containerId) {
            $A.query().search('tata')
                    .fields('tata_id', 'tast_id', 'description', 'tata_update_time', 'status', 'deadline')
                    .where({
                        tata_delete_time: 'is Null',
                        assignee_id: mapper.assignee_id,
                        workspace: null,
                        visibility: 'workspaces',
                        status: ['created', 'assigned', 'started', 'awaitingfeedback']
                    })
                    .order([{tbl: 'tata', col: 'create_time', sort: 'desc'}]).page(1)
                    .execute(containerId, this, mapper);
        },
        name: 'dashboardAssignedTaskList',
        mapper: ['assignee_id'],
        identifier: ['assignee_id'],
        tbls: ['tata'],

        component: function (data, containerId, mapper) {
            const container = $A.dom.containerElement(containerId);
            let ul = $A.dom.searchElementCorrectly('ul.list-group', container);
            let originalLiItem = $A.dom.searchElementCorrectly('li.list-group-item', ul);

            $A.ui.handleEmptyData(data, ul);

            data.forEach(item => {
                let li = originalLiItem.cloneNode(true);
                li.classList.remove('d-none');
                li.querySelector('.description').dataset.stateMapperTaskId = $A.forms.escapeHtml(item.tata_id);
                li.querySelector('.description').textContent = item.description || JSON.stringify(item);
                li.querySelector('.status').textContent = $A.forms.escapeHtml(item.status);
                li.querySelector('.tata_update_time').textContent = $A.dates.convertToDisplayLocal(item.tata_update_time);
                li.querySelector('.deadline').textContent = $A.dates.convertToDisplayLocal(item.deadline);
                ul.appendChild(li);
            });

            let refresh = $A.dom.searchElementCorrectly('.refresh-btn', container);
            refresh.dataset.stateMapperAssignee_id = mapper.assignee_id;
        }
    },
}

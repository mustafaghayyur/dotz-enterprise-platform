import $A from "../helper.js";

/**
 * Maps fetched ToDos to page elements.
 * 
 * @param {obj} data: results object from Fetcher call
 * @param {str} containerId: Id of the container to show any error messages.
 */
export default {
    default: {
        // mapper.assignee_id = A.app.memFetch('user', true).id
        fetch: function (mapper, containerId, componentName) {
            $A.query().search('tata')
            .fields('tata_id', 'tast_id', 'description', 'tata_update_time', 'status')
            .where({
                tata_delete_time: 'is Null',
                assignee_id: mapper.assignee_id,
                visibility: 'private',
            })
            .order([
                {tbl: 'tata', col: 'update_time', sort: 'desc'},
                {tbl: 'tast', col: 'create_time', sort: 'desc'}
            ]).page(1)
            .execute(containerId, this);
        },

        name: 'dashboardTodoList',
        mapper: [['assignee_id', 'number']],
        identifier: ['assignee_id'],
        tbls: ['tata'],

        component: async function (data, containerId) {
            const container = $A.dom.containerElement(containerId);
            let ul = $A.dom.searchElementCorrectly('ul.list-group', container);
            let originalLiItem = $A.dom.searchElementCorrectly('li.list-group-item', ul);

            $A.ui.handleEmptyData(data, ul);

            const toDos = await $A.state.call('dashboardTodoList.sortToDoRecords', data);
            toDos.forEach(item => {
                let li = originalLiItem.cloneNode(true);
                li.classList.remove('d-none');
                let status = $A.dom.searchAllElementsCorrectly(`.status i.bi`, li);
                let currStatus = $A.dom.searchElementCorrectly(`.status .${item.status}`, li);
                let desc = $A.dom.searchElementCorrectly('.description', li);
                desc.dataset.taskId = $A.forms.escapeHtml(item.tata_id);
                desc.textContent = $A.forms.escapeHtml(item.description);
                
                status.forEach((sts) => {
                    // hide each status btn...
                    sts.classList.remove('d-none');
                    sts.classList.add('d-none');
                });
                currStatus.classList.remove('d-none'); // then show currStatus
                

                if (item.status === 'completed') {
                    desc.classList.add('text-decoration-line-through');
                    desc.classList.add('text-muted');
                }
                
                li.querySelector('.status').addEventListener('click', 
                    () => { 
                        $A.state.dom.addMapperArguments(container, 'confirm-message', 'Your ToDo item has been updated.');

                        $A.state.crud.update('tata', {
                            tata_id: item.tata_id,
                            tast_id: item.tast_id,
                            status: 'assignedcompleted'.replace(item.status, '') // @todo: find a better determining operation  
                        }, container);
                    });
                li.querySelector('.delete').addEventListener('click', 
                    () => { 
                        if (!$A.forms.confirmDeletion(identifyer)) {
                            return null;
                        }
                        $A.state.dom.addMapperArguments(container, 'confirm-message', 'Your ToDo has been removed.`');
                        $A.state.crud.delete('tata', { tata_id: item.tata_id }, container);
                    });

                ul.appendChild(li);
            });

            // initialize tooltips of dynamic todo items...
            $A.app.initializeTooltips(ul, false); // initialize tooltips

        }
    },

    sortToDoRecords: {
        fetch: function (mapper, containerId) {
            return this.component({}, containerId, mapper);
        },

        name: 'dashboardTodoList.sortToDoRecords',
        mapper: [],
        cache: false,

        /**
         * Sorts ToDo records based on assigned first, then completed.
         * 
         * @param {arr} data: list of Todo (task) records supplied by API
         */
        component: function (trash, containerId, data) {
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
};

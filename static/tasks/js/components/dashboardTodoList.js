import $A from "../helper.js";

/**
 * Operates ToDo list on Tasks Personal Dashboard
 */
export default {
    default: {
        // mapper.assignee_id = A.app.memFetch('user', true).id
        fetch: function (mapper, containerId) {
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
            .translate({debug: true})
            .execute(containerId, this, mapper);
        },

        name: 'dashboardTodoList',
        mapper: [['assignee_id', 'number']],
        identifier: ['assignee_id'],
        tbls: ['tata'],

        component: async function (data, containerId, mapper) {
            const container = $A.dom.containerElement(containerId);
            let ul = $A.dom.searchElementCorrectly('ul.list-group', container);
            let originalLiItem = $A.dom.searchElementCorrectly('li.list-group-item', ul);

            $A.ui.handleEmptyData(data, ul);

            const toDos = await $A.state.call('dashboardTodoList.sortToDoRecords', {data: data});

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
                
                let delBtn = $A.dom.searchElementCorrectly('.delete.btn', li);
                let toggleStatusBtn = $A.dom.searchElementCorrectly('.status.btn', li);
                $A.state.dom.addMapperArguments(delBtn, 'data', { tata_id: item.tata_id, description: item.description });
                $A.state.dom.addMapperArguments(toggleStatusBtn, 'data', { tata_id: item.tata_id, tast_id: item.tast_id, status: item.status, description: item.description });
                ul.appendChild(li);
            });

            let refresh = $A.dom.searchElementCorrectly('.refresh-btn', container);
            refresh.dataset.stateMapperAssignee_id = mapper.assignee_id;
        }
    },

    /**
     * Sorts ToDo records based on assigned first, then completed.
     */
    sortToDoRecords: {
        name: 'dashboardTodoList.sortToDoRecords',
        mapper: [],
        cache: false,
        component: function (trash, containerId, mapper) {
            let data = mapper.data;
            if($A.base.not(data, 'list')){
                throw Error('Data Error: Could not fetch ToDo records in array format.');
            }
            
            // Separate records by status, maintaining original order within each group
            const assigned = data.filter(item => item.status === 'assigned');
            const completed = data.filter(item => item.status === 'completed');
            
            // Return assigned first, then completed
            return [...assigned, ...completed];
        }
    },

    delete: {
        name: 'dashboardTodoList.delete',
        mapper: ['data'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let { description, ...data } = mapper.data;
            $A.state.crud.delete('tata', data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                confirmationMessage: $A.base.get(mapper,'confirmMessage', `ToDo item "${description.slice(0, 30)}..." has been removed.`),
                identifierString: $A.base.get(mapper, 'identifierString', `ToDo "${description.slice(0, 50)}..."`),
            });
        }
    },

    toggleStatus: {
        name: 'dashboardTodoList.toggleStatus',
        mapper: ['data'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let { description, ...data } = mapper.data;
            data.status = 'assignedcompleted'.replace(mapper.data.status, '') // @todo: find a better determining operation  
            $A.state.crud.update('tata', data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                confirmationMessage: $A.base.get(mapper,'confirmMessage', `ToDo item "${description.slice(0, 30)}..." has been updated.`),
            });
        }
    },
};

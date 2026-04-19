import $A from "../../helper.js";

/**
 * Displays complete task record. With all functionality for that pane.
 * 
 * @param {object} task - retrieved from Fetcher() internal function fetchResource()
 * @param {string} containerId - html id for DOM element in which responses from Fetcher are auto-embedded
 */
export default {
    default: {
        fetch: function (mapper, containerId) {
            $A.query().read('tata', { tata_id: mapper.taskId })
                .execute(containerId, this, mapper);
        },
        name: 'taskDetailsView',
        mapper: ['taskId'],
        tbls: ['tata'],
        identifier: ['taskId'],

        component: async function (task, containerId) {
            let container = $A.dom.containerElement(containerId);
            
            if ($A.base.not(task, 'dictionary')) {
                throw Error('UI Error: Task object retrieved in Detail view not of dictionary type.');
            }

            const editBtn = $A.dom.searchElementCorrectly('.edit.btn', container);
            $A.state.dom.addMapperArguments(editBtn, 'data', {data: task});
            const deleteBtn = $A.dom.searchElementCorrectly('.btn.delete', container);
            $A.state.dom.addMapperArguments(deleteBtn, 'data', { tata_id: task.tata_id });
            
            container = $A.ui.embedData(task, container, true);
            const creator = $A.app.user(task.creator_id, containerId);
            const assignor = $A.app.user(task.assignor_id, containerId);
            const assignee = $A.app.user(task.assignee_id, containerId);
            $A.dom.searchElementCorrectly('.embed.creator_id', container).textContent = `${$A.base.get(creator, 'first_name')} ${$A.base.get(creator, 'last_name')}`;
            $A.dom.searchElementCorrectly('.embed.assignor_id', container).textContent = `${$A.base.get(assignor, 'first_name')} ${$A.base.get(assignor, 'last_name')}`;
            $A.dom.searchElementCorrectly('.embed.assignee_id', container).textContent = `${$A.base.get(assignee, 'first_name')} ${$A.base.get(assignee, 'last_name')}`;
            
            // add functionality on task-details modal...
            await $A.state.call('taskDetailsView.userWatchState', { 'tata_id': task.tata_id });
            await $A.state.call('taskComments.createForm', { 'tata_id': task.tata_id });
            await $A.state.call('taskComments', { 'tata_id': task.tata_id });
        }
    },

    /**
     * Handles current state of user watching task
     * 
     * @param {arr} data: api data 
     * @param {str} containerId 
     */
    userWatchState: {
        fetch: function (mapper, containerId) {
            $A.query().read('tawa', {
                task_id: mapper.tata_id
            }).execute(containerId, this, mapper);
        },
        name: 'taskDetailsView.userWatchState',
        mapper: ['tata_id'],
        tbls: ['tawa'],
        identifier: ['tata_id'],

        component: function(data, containerId, mapper) {
            let container = $A.dom.containerElement(containerId);
            let watchBtn = $A.dom.searchElementCorrectly('.btn.watch', container);
            let unwatchBtn = $A.dom.searchElementCorrectly('.btn.un-watch', container);

            if ($A.base.get(data, 'id', null) === null) {
                watchBtn.classList.remove('d-none');
                unwatchBtn.classList.add('d-none');
            } else {
                unwatchBtn.classList.remove('d-none');
                watchBtn.classList.add('d-none');
            }

            $A.state.dom.addMapperArguments(watchBtn, 'data', { 'task_id': mapper.tata_id });
            $A.state.dom.addMapperArguments(unwatchBtn, 'data', { 'task_id': mapper.tata_id });
        }
    },
    
    delete: {
        name: 'taskDetailsView.delete',
        mapper: ['data'],
        cache: false,
        component: function (trash, containerId, mapper) {
            $A.state.crud.delete('tata', mapper.data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                confirmationMessage: $A.base.get(mapper,'confirmMessage', `Task item #${mapper.data.tata_id} has been archived without errors.`),
                identifierString: $A.base.get(mapper, 'identifierString', `Task item #${mapper.data.tata_id}`),
            });
        }
    },

    watcherDelete: {
        name: 'taskDetailsView.watcherDelete',
        mapper: ['data'],
        cache: false,
        component: function (trash, containerId, mapper) {
            $A.state.crud.delete('tawa', mapper.data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                confirmationMessage: $A.base.get(mapper,'confirmMessage', `No longer watching task #${mapper.data.tata_id}.`),
                identifierString: $A.base.get(mapper, 'identifierString', `Watch-state for Task item #${mapper.data.tata_id}`),
            });
        }
    },

    watcherAdd: {
        name: 'taskDetailsView.watcherAdd',
        mapper: ['data'],
        cache: false,
        component: function (trash, containerId, mapper) {
            $A.state.crud.create('tawa', mapper.data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                confirmationMessage: $A.base.get(mapper,'confirmMessage', `Now watching task #${mapper.data.tata_id}.`),
            });
        }
    },
}

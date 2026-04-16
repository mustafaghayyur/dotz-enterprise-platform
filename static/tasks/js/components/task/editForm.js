import $A from "../../helper.js";

/**
 * Enabled all features in Task Edit Form.
 * 
 * @param {obj|str} taskInfo: full task record to edit | or string carrying current workspace_id
 */
export default {
    default: {
        fetch: function (taskInfo, containerId) {
            this.component({}, containerId, taskInfo);
        },
        name: 'taskEditForm',
        mapper: [],
        cache: false,

        component: async function(data, containerId, taskInfo) {
            if ($A.generic.checkVariableType(taskInfo) !== 'dictionary' || $A.generic.isVariableEmpty(taskInfo)) {
                if (!$A.generic.isPrimitiveValue(taskInfo) || $A.generic.isVariableEmpty(taskInfo)) {
                    throw Error('Error FA099: WorkSpace id must be provided in primitive data value format.')
                }

                taskInfo = {
                    workspace_id: taskInfo
                };
            }
            
            // Prefill form with workspace data if provided
            if ($A.generic.checkVariableType(taskInfo) === 'dictionary') {
                $A.tasks.forms.prefillEditForm(taskInfo, 'taskEditForm');
            }
            
            let container = $A.dom.containerElement(containerId);
            let visibility = $A.dom.searchElementCorrectly('form input[name="visibility"]', container);
            let workspace_id = $A.dom.searchElementCorrectly('form input[name="workspace_id"]', container);
            
            visibility.value = $A.tasks.data.values.visibility.workspaces;
            workspace_id.value = taskInfo.workspace_id;

            $A.app.handleScreenSizeAdjustments($A.data.screens.sm, () => {
                // make some room for keyboard in mobile views...
                let form = $A.dom.searchElementCorrectly(container.id + 'Form', container);
                let bufferDiv = $A.dom.makeDomElement('div', '', 'buffer');
                form.insertAdjacentElement('afterend', bufferDiv);
            });

            // task list for workspace
            await $A.state.call('taskEditForm.embedTasksData', taskInfo);

            // users for workspace
            await $A.state.call('taskEditForm.embedUsersData', taskInfo);


            // Edit Task Modal: Save Operations Setup...
            const editTaskSaveBtn = $A.dom.searchElementCorrectly('#taskEditFormSaveBtn', container);
            const tata_id = $A.dom.searchElementCorrectly('form input[name="tata_id"]', container);
            $A.state.dom.addMapperArguments(editTaskSaveBtn, 'task-id', tata_id.value);
            
            $A.app.eventListener('click', editTaskSaveBtn, (e) => {
                e.preventDefault();
                const tataId = e.currentTarget.dataset.stateMapperTaskId;
                let dictionary = $A.tasks.forms.generateDictionaryFromForm(container.id + 'Form');
                if ($A.generic.isVariableEmpty(tataId)) {
                    $A.state.dom.addMapperArguments(container, 'confirm-message', 'Your Task item has been saved.');
                    $A.state.crud.create('tata', dictionary, container);
                } else {
                    $A.state.dom.addMapperArguments(container, 'confirm-message', 'Your changes have been saved.');
                    $A.state.crud.update('tata', dictionary, container);
                }
            });

            $A.app.eventListener('hide.bs.modal', container, (e) => {
                if (!$A.forms.confirm('close Task Edit Panel', 'Any unsaved data will be lost.')) {
                    e.preventDefault();
                    return null;
                }
            });
        
        }
    },

    embedTasksData: {
        fetch: function (task, containerId) {
            $A.query().search('tata').fields('tata_id', 'description').where({
                    workspace_id: task['workspace_id'],
                }).order([{tbl:'tata', col: 'id', sort: 'desc'}])
                .execute(containerId, this, mapper);
        },
        name: 'taskEditForm.embedTasksData',
        mapper: ['workspace_id'],
        identifier: ['workspace_id'],
        tbls: ['tata', 'wowo'],

        /**
         * Embeds the data from query into form Select Fields.
         * For Task Ids
         * @param {obj} data 
         * @param {str} containerId 
         */
        component: function (data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let select = container.querySelector('form select[name="parent_id"]');

            if ($A.generic.checkVariableType(select) !== 'domelement') {
                throw Error('Error FA004: Cannot find Task Parent Select Field.');
            }

            if ($A.generic.checkVariableType(data) !== 'list') {
                throw Error('Error FA005: Cannot parse data object.');
            }

            data.forEach((itm) => {
                let elem = $A.dom.makeDomElement('option');
                elem.textContent = itm.description;
                elem.value = itm.tata_id;
                if (taskInfo.parent_id === itm.tata_id) {
                    elem.setAttribute("selected", "true");
                }
                select.appendChild(elem);
            });
        }
    },

    embedUsersData: {
        fetch: function(task, containerId) {
            $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name'
                ).join({
                    'left|usus_id': 'wous_user_id',
                }).where({
                    wous_workspace_id: task['workspace_id'],
                }).order([
                    {tbl:'usus', col: 'last_name', sort: 'asc'},
                    {tbl:'usus', col: 'first_name', sort: 'asc'}
                ]).execute(containerId, this, task);
        },
        name: 'taskEditForm.embedUsersData',
        mapper: ['workspace_id'],
        identifier: ['workspace_id'],
        tbls: ['usus', 'wowo'],

        /**
         * Embeds the data from query into form Select Fields.
         * For User Ids
         * @param {obj} data 
         * @param {str} containerId 
         */
        component: function (data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let select1 = container.querySelector('form select[name="assignor_id"]');
            let select2 = container.querySelector('form select[name="assignee_id"]');

            if ($A.generic.checkVariableType(select1) !== 'domelement') {
                throw Error('Error FA001: Cannot find Assignor Select Field.');
            }

            if ($A.generic.checkVariableType(select2) !== 'domelement') {
                throw Error('Error FA002: Cannot find Assignee Select Field.');
            }

            if ($A.generic.checkVariableType(data) !== 'list') {
                throw Error('Error FA003: Cannot parse data object.');
            }

            data.forEach((itm) => {
                let elem1 = $A.dom.makeDomElement('option');
                elem1.textContent = itm.first_name + ' ' + itm.last_name + ' (@' + itm.username + ')';
                elem1.value = itm.usus_id;

                if (taskInfo.assignor_id === itm.usus_id) {
                    elem1.setAttribute("selected", "true");
                }

                let elem2 = elem1.cloneNode(true);
                if (taskInfo.assignee_id === itm.usus_id) {
                    elem2.setAttribute("selected", "true");
                }

                select1.appendChild(elem1);
                select2.appendChild(elem2);
            });
        }
    }
}

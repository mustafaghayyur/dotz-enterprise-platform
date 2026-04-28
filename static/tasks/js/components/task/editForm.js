import $A from "../../helper.js";

/**
 * Enabled all features in Task Edit Form.
 * 
 * @param {obj|str} mapper: full task record to edit | or string carrying current workspace_id
 */
export default {
    default: {
        name: 'taskEditForm',
        mapper: [['wowoId', 'number']],
        cache: false,

        component: async function(trash, containerId, mapper) {
            let container = $A.dom.containerElement(containerId);
            let data = $A.base.get(mapper, 'data', {});
            console.log('MG - inspecting mapper data in task form: ', mapper, data);
            $A.tasks.forms.cleanTaskForm(container.id + 'Form');
            if ($A.base.empty(data)) {
                data['workspace_id'] =  mapper.wowoId;
                data['visibility'] =  $A.tasks.data.values.visibility.workspaces;
            }
            
            // Prefill form with workspace data if provided
            $A.tasks.forms.prefillEditForm(data, container.id + 'Form');
            
            let visibility = $A.dom.searchElementCorrectly('form input[name="visibility"]', container);
            let workspace_id = $A.dom.searchElementCorrectly('form input[name="workspace_id"]', container);
            
            visibility.value = $A.tasks.data.values.visibility.workspaces;
            workspace_id.value = data.workspace_id;

            $A.app.handleScreenSizeAdjustments($A.data.screens.sm, () => {
                // make some room for keyboard in mobile views...
                let form = $A.dom.searchElementCorrectly(container.id + 'Form', container);
                let bufferDiv = $A.dom.makeDomElement('div', '', 'buffer');
                form.insertAdjacentElement('afterend', bufferDiv);
            });

            // task list for workspace
            await $A.state.call('taskEditForm.embedTasksData', data);

            // users for workspace
            await $A.state.call('taskEditForm.embedUsersData', data);

            // save button operations..
            const saveBtn = $A.dom.searchElementCorrectly('.btn.save', container);
            $A.state.dom.addMapperArguments(saveBtn, 'form-id', container.id + 'Form');

            $A.app.eventListener('hide.bs.modal', container, (e) => {
                if (!$A.forms.confirm('close Task Edit Panel', 'Any unsaved data will be lost.')) {
                    e.preventDefault();
                    return null;
                }
            });
        }
    },

    embedTasksData: {
        fetch: function (mapper, containerId) {
            $A.query().search('tata').fields('tata_id', 'description').where({
                    workspace_id: mapper['workspace_id'],
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
        component: function (data, containerId, mapper) {
            let container = $A.dom.containerElement(containerId);
            let select = container.querySelector('form select[name="parent_id"]');

            if ($A.base.not(select, 'domelement')) {
                throw Error('Error FA004: Cannot find Task Parent Select Field.');
            }

            if ($A.base.not(data, 'list')) {
                throw Error('Error FA005: Cannot parse data object.');
            }

            data.forEach((itm) => {
                let elem = $A.dom.makeDomElement('option');
                elem.textContent = itm.description;
                elem.value = itm.tata_id;
                if (mapper.parent_id === itm.tata_id) {
                    elem.setAttribute("selected", "true");
                }
                select.appendChild(elem);
            });
        }
    },

    embedUsersData: {
        fetch: function(mapper, containerId) {
            $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name'
                ).join({
                    'left|usus_id': 'wous_user_id',
                }).where({
                    wous_workspace_id: mapper['workspace_id'],
                }).order([
                    {tbl:'usus', col: 'last_name', sort: 'asc'},
                    {tbl:'usus', col: 'first_name', sort: 'asc'}
                ]).execute(containerId, this, mapper);
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
        component: function (data, containerId, mapper) {
            let container = $A.dom.containerElement(containerId);
            let select1 = container.querySelector('form select[name="assignor_id"]');
            let select2 = container.querySelector('form select[name="assignee_id"]');

            if ($A.base.not(select1, 'domelement')) {
                throw Error('Error FA001: Cannot find Assignor Select Field.');
            }

            if ($A.base.not(select2, 'domelement')) {
                throw Error('Error FA002: Cannot find Assignee Select Field.');
            }

            if ($A.base.not(data, 'list')) {
                throw Error('Error FA003: Cannot parse data object.');
            }

            data.forEach((itm) => {
                let elem1 = $A.dom.makeDomElement('option');
                elem1.textContent = itm.first_name + ' ' + itm.last_name + ' (@' + itm.username + ')';
                elem1.value = itm.usus_id;

                if (mapper.assignor_id === itm.usus_id) {
                    elem1.setAttribute("selected", "true");
                }

                let elem2 = elem1.cloneNode(true);
                if (mapper.assignee_id === itm.usus_id) {
                    elem2.setAttribute("selected", "true");
                }

                select1.appendChild(elem1);
                select2.appendChild(elem2);
            });
        }
    },
        
    save: {
        name: 'taskEditForm.save',
        mapper: ['formId'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let data = $A.tasks.forms.generateDictionaryFromForm(mapper.formId);
            if ($A.base.empty(data.tata_id)) {
                $A.state.crud.create('tata',  data, {
                    responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                    confirmationMessage: $A.base.get(mapper,'confirmMessage', `Task item: "${data.description.slice(0, 50)}..." has been saved to system.`),
                });
            } else {
                $A.state.crud.update('tata',  data, {
                    responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                    confirmationMessage: $A.base.get(mapper,'confirmMessage', `Task item #${data.tata_id} has been updated.`),
                });
            }
        }
    },
}

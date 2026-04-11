import $A from "../../helper.js";

/**
 * Enabled all features in Task Edit Form.
 * 
 * @param {obj|str} taskInfo: full task record to edit | or string carrying current workspace_id
 */
export default {
    default: {
        fetch: function (mapper, containerId) {
            this({}, containerId, mapper);
        },
        name: 'workspaceProjectEditForm',
        cache: false,

        component: function(data, containerId, wowoData) {
            let container = $A.dom.obtainElementCorrectly(containerId);
            const WorkSpaceO2OKeys = $A.app.memFetch('o2oWorkSpaceFields', true);

            $A.tasks.forms.cleanTaskForm(container.id + 'Form', WorkSpaceO2OKeys);

            // Prefill form with workspace data if provided
            if ($A.generic.checkVariableType(wowoData) === 'dictionary') {
                $A.forms.prefillForms(wowoData, container.id + 'Form');
            }

            $A.app.handleScreenSizeAdjustments($A.data.screens.sm, () => {
                // make some room for keyboard in mobile views...
                let form = $A.dom.searchElementCorrectly('form', container);
                let bufferDiv = $A.dom.makeDomElement('div', '', 'buffer');
                form.insertAdjacentElement('afterend', bufferDiv);
            });

            // departments list for workspace...
            $A.state.call('workspaceEditForm.embedDepartmentsData');

            // Save Operations Setup (Edit WorkSpace Modal)...
            const editTaskSaveBtn = $A.dom.obtainElementCorrectly('workSpaceEditFormSaveBtn');
            $A.state.dom.addMapperArguments(editTaskSaveBtn, 'workspace-id', wowoData.wowo_id)
            
            $A.app.eventListener('click', editTaskSaveBtn, (e) => {
                e.preventDefault();
                const wowoId = e.currentTarget.dataset.stateMapperWorkspaceId;
                let dictionary = $A.tasks.forms.generateDictionaryFromForm(container.id + 'Form');

                if ($A.generic.isVariableEmpty(wowoId)) {
                    // @todo: handle depts and users being added/updated..

                    $A.state.crud.create('wowo', dictionary, container, (resp, respConId) => {
                        $A.app.generateResponseToAction(respConId, `Your WorkSpace has been created.`);
                        dictionary['wowo_id'] = resp.wowo_id;

                        $A.state.crud.create('wode', dictionary, true).execute(containerId, (resp2, respConId2) => {
                            $A.app.generateResponseToAction(respConId2, `Departments added to WorkSpace.`);
                        });
                        
                        $A.state.crud.create('wous', dictionary, true).execute('workSpaceEditModalResponse', (resp3, respConId3) => {
                            $A.app.generateResponseToAction(respConId3, `Team Leader added to WorkSpace.`);
                        });
                    });
                } else {
                    $A.state.crud.update('wowo', dictionary, container, (resp, respConId) => {
                        $A.app.generateResponseToAction(respConId, `Your WorkSpace has been created.`);

                        $A.state.crud.update('wode', dictionary, true).execute(containerId, (resp2, respConId2) => {
                            $A.app.generateResponseToAction(respConId2, `Departments added to WorkSpace.`);
                        });
                        
                        $A.state.crud.update('wous', dictionary, true).execute('workSpaceEditModalResponse', (resp3, respConId3) => {
                            $A.app.generateResponseToAction(respConId3, `Team Leader added to WorkSpace.`);
                        });
                    });
                }
            });

            // handle modal close confirmation...
            $A.app.eventListener('hide.bs.modal', container, (e) => {
                if (!$A.forms.confirm('close WorkSpace Edit Panel', 'Any unsaved data will be lost.')) {
                    e.preventDefault();
                    return null;
                }
            });
        }
    },

    embedDepartmentsData: {
        fetch: function(mapper, containerId) {
            $A.query().search('dede').fields('dede_id', 'name')
                .order([{tbl:'dede', col: 'id', sort: 'desc'}])
                .execute(containerId, this);
        },
        name: 'workspaceProjectEditForm.embedDepartmentsData',
        tbls: ['dede'],
        identifier: [],

        /**
         * Embeds the data from query into form Select Fields.
         * For Department Ids
         * @param {obj} data 
         * @param {str} containerId 
         */
        component: function (data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let select = container.querySelector('form select[name="department_id"]');

            if ($A.generic.checkVariableType(select) !== 'domelement') {
                throw Error('Error FB004: Cannot find Department Select Field.');
            }

            if ($A.generic.checkVariableType(data) !== 'list') {
                throw Error('Error FB005: Cannot parse data object.');
            }

            data.forEach((itm) => {
                let elem = $A.dom.makeDomElement('option');
                elem.textContent = itm.name;
                elem.value = itm.dede_id;
                select.appendChild(elem);
            });
        }
    }
}

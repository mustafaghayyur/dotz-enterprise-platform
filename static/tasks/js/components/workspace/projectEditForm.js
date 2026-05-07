import $A from "../../helper.js";

/**
 * Enabled all features in Task Edit Form.
 * 
 * @param {obj|str} taskInfo: full task record to edit | or string carrying current workspace_id
 */
export default {
    default: {
        name: 'workspaceProjectEditForm',
        mapper: ['workspace'],
        resetArgs: ['workspace'],
        cache: false,

        component: async function(data, containerId, mapper) {
            let workspace = mapper.workspace;
            let container = $A.dom.containerElement(containerId);
            const WorkSpaceO2OKeys = $A.app.memFetch('o2oWorkSpaceFields', true);

            $A.tasks.forms.cleanTaskForm(container.id + 'Form', WorkSpaceO2OKeys);

            // Prefill form with workspace data if provided
            if ($A.base.is(workspace, 'dictionary')) {
                $A.forms.prefillForms(workspace, container.id + 'Form');
            }
            
            $A.ui.enableCollapseToggle('workspaceProjectEditFormAccordion', 'workspace-toggle-btn', container);

            $A.app.handleScreenSizeAdjustments($A.data.screens.sm, () => {
                // make some room for keyboard in mobile views...
                let form = $A.dom.searchElementCorrectly('form', container);
                let bufferDiv = $A.dom.makeDomElement('div', '', 'buffer');
                form.insertAdjacentElement('afterend', bufferDiv);
            });

            // departments list for workspace...
            await $A.state.call('workspaceProjectEditForm.embedDepartmentsData');

            // Save Operations Setup (Edit WorkSpace Modal)...
            const editTaskSaveBtn = $A.dom.obtainElementCorrectly('workSpaceBasicSettingsSaveBtn');
            $A.state.dom.addMapperArguments(editTaskSaveBtn, 'workspace-id', workspace.wowo_id)
            
            $A.app.eventListener('click', editTaskSaveBtn, (e) => {
                e.preventDefault();
                const wowoId = e.currentTarget.dataset.stateMapperWorkspaceId;
                let dictionary = $A.tasks.forms.generateDictionaryFromForm(container.id + 'Form');

                if ($A.base.empty(wowoId)) {
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

            // enable workspace data on all buttons in container
            let btns = $A.dom.searchAllElementsCorrectly('.btn', container);
            btns.forEach((btn) => {
                btn.setAttribute('data-state-mapper-workspace', $A.base.stringify(workspace, false));
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
            return $A.query().search('dede').fields('dede_id', 'name')
                .order([{tbl:'dede', col: 'id', sort: 'desc'}])
                .execute(containerId, this, mapper);
        },
        name: 'workspaceProjectEditForm.embedDepartmentsData',
        mapper: [],
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

            if ($A.base.not(select, 'domelement')) {
                throw Error('Error FB004: Cannot find Department Select Field.');
            }

            if ($A.base.not(data, 'list')) {
                throw Error('Error FB005: Cannot parse data object.');
            }

            data.forEach((itm) => {
                let elem = $A.dom.makeDomElement('option');
                elem.textContent = itm.name;
                elem.value = itm.dede_id;
                select.appendChild(elem);
            });
        }
    },
    
    deleteAction: {
        name: 'workspaceProjectEditForm.deleteAction',
        mapper: ['workspace'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let data = {}; // mapper.workspace; @todo: implement someday
            $A.state.crud.delete('wowo', data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                identifierString: $A.base.get(mapper, 'identifierString', `${mapper.workspace.name}]? This action will cause severe interruptions to existing Task cycles. The WorkSpace will remain open for 24 hours post closing to allow for a smooth transition. [Proceed`),
            }, (trash, respConId) => { 
                $A.app.generateResponseToAction(respConId, $A.base.get(mapper,'confirmMessage', `Workspace [${mapper.workspace.name}] has been marked for closure. Workspace will close at midnight after 24 hours from now.`));
            });
        }
    },

    wsPaneTwo: {
        name: 'workspaceProjectEditForm.wsPaneTwo',
        mapper: ['workspace'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let workspace = mapper.workspace; 
            console.log('User Settings for workspace: 2', workspace);
        }
    },

    wsPaneThree: {
        name: 'workspaceProjectEditForm.wsPaneThree',
        mapper: ['workspace'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let workspace = mapper.workspace; 
            console.log('User Settings for workspace: 1', workspace);
        }
    }
}

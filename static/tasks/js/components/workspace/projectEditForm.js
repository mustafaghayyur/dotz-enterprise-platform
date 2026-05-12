import $A from "../../helper.js";

/**
 * Enabled all features in WorkSpace Settings Pane.
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
            await $A.state.call('workspaceProjectEditForm.wsPaneOneLogic', mapper);
            $A.ui.enableCollapseToggle('workspaceProjectEditFormAccordion', 'workspace-toggle-btn', container);
            $A.app.handleScreenSizeAdjustments($A.data.screens.sm, () => {
                // make some room for keyboard in mobile views...
                let form = $A.dom.searchElementCorrectly('#workspaceProjectEditFormAccordion', container);
                let bufferDiv = $A.dom.makeDomElement('div', '', 'buffer');
                form.insertAdjacentElement('afterend', bufferDiv);
            });

            // enable workspace data on all buttons in container
            let btns = $A.dom.searchAllElementsCorrectly('.btn', container);
            btns.forEach((btn) => {
                btn.setAttribute('data-state-mapper-workspace', $A.base.stringify(workspace, false));
            });
            $A.ui.confirmFormClose(container);
        }
    },

    wsPaneOneLogic: {
        name: 'workspaceProjectEditForm.wsPaneOneLogic',
        mapper: ['workspace'],
        refresh: false,
        cache: false,
        component: function (trash, containerId, mapper) {
            let workspace = mapper.workspace; 
            let container = $A.dom.containerElement(containerId);
            let formId = container.id + 'Form';
            let form = $A.dom.searchElementCorrectly('form', container);
           
            $A.tasks.forms.cleanTaskForm(formId);
            if ($A.base.is(workspace, 'dictionary')) {
                $A.forms.prefillForms(workspace, formId);
            }

            // Save Operations Setup (Edit WorkSpace Modal)...
            const editBtn = $A.dom.searchElementCorrectly('.save-btn', form);
            $A.state.dom.addMapperArguments(editBtn, 'form-id', formId);
            return null;
        }
    },

    wsPaneTwoLogic: {
        name: 'workspaceProjectEditForm.wsPaneTwoLogic',
        mapper: ['workspace'],
        refresh: false,
        cache: false,
        component: function (trash, containerId, mapper) {
            let workspace = mapper.workspace;  
            let container = $A.dom.containerElement(containerId);
            let formId = 'workspaceLifeCycleForm';
            let form = $A.dom.searchElementCorrectly('form', container);
            $A.tasks.forms.cleanTaskForm(formId);
            if ($A.base.is(workspace, 'dictionary')) {
                $A.forms.prefillForms(workspace, formId);
            }
            const editBtn = $A.dom.searchElementCorrectly('.save-btn', form);
            $A.state.dom.addMapperArguments(editBtn, 'form-id', formId);
        }
    },
    
    
    save: {
        name: 'workspaceProjectEditForm.save',
        mapper: ['formId'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let data = $A.tasks.forms.generateDictionaryFromForm(mapper.formId);
            if ($A.base.empty(data.wowo_id)) {
                $A.state.crud.create('wowo',  data, {
                    responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                    confirmationMessage: $A.base.get(mapper,'confirmMessage', `WorkSpace Settings for: "${data.name.slice(0, 50)}..." have been saved to system.`),
                });
            } else {
                $A.state.crud.update('wowo',  data, {
                    responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                    confirmationMessage: $A.base.get(mapper,'confirmMessage', `WorkSpace Settings for: "${data.name.slice(0, 50)}..." have been updated.`),
                });
            }
        }
        /**
        $A.state.crud.update('wode', dictionary, true).execute(containerId, (resp2, respConId2) => {
            $A.app.generateResponseToAction(respConId2, `Departments added to WorkSpace.`);
        });
        
        $A.state.crud.update('wous', dictionary, true).execute('workSpaceEditModalResponse', (resp3, respConId3) => {
            $A.app.generateResponseToAction(respConId3, `Team Leader added to WorkSpace.`);
        });
         */
    },
    
    delete: {
        name: 'workspaceProjectEditForm.delete',
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
}

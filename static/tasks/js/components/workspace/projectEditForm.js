import $A from "../../helper.js";

/**
 * Enabled all features in WorkSpace Settings Pane.
 */
export default {
    default: {
        name: 'workspaceProjectEditForm',
        //mapper: ['workspace'],
        resetArgs: ['workspace'],
        cache: false,

        component: async function(data, containerId, mapper) {
            let workspace = $A.base.get(mapper, 'workspace', {});
            let container = $A.dom.containerElement(containerId);
            
            await $A.state.call('workspaceProjectEditForm.wsPaneOne', mapper);
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

    wsPaneOne: {
        name: 'workspaceProjectEditForm.wsPaneOne',
        //mapper: ['workspace'],
        refresh: false,
        cache: false,
        component: function (trash, containerId, mapper) {
            let workspace = $A.base.get(mapper, 'workspace', {});
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

            // Prevent standard HTTP form submission (which causes 403 CSRF errors)
            $A.state.events.eventListener('submit', form, (e) => {
                e.preventDefault();
                $A.state.call('workspaceProjectEditForm.save', { formId: formId });
            });
            return null;
        }
    },

    wsPaneTwo: {
        name: 'workspaceProjectEditForm.wsPaneTwo',
        //mapper: ['workspace'],
        refresh: false,
        cache: false,
        component: function (trash, containerId, mapper) {
            let workspace = $A.base.get(mapper, 'workspace', {}); 
            let container = $A.dom.containerElement(containerId);
            let formId = 'workspaceLifeCycleForm';
            let form = $A.dom.searchElementCorrectly('form', container);
            
            if ($A.base.get(workspace, 'wowo_id', null) === null) {
                throw Error('Project LifeCycle Settings cannot be set until WorkSpace is saved in system.');
            }
            
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

        /**
         * Create of Update WorkSpace record based on fetched form data.
         * Add current user as first team member, upon creation of workspace.
         */
        component: function (trash, containerId, mapper) {
            let data = $A.tasks.forms.generateDictionaryFromForm(mapper.formId);
            if ($A.base.empty(data.wowo_id)) {
                $A.state.crud.create('wowo',  data, {
                    responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                    confirmationMessage: $A.base.get(mapper,'confirmMessage', `WorkSpace Settings for: "${data.name.slice(0, 50)}..." have been saved to system.`),
                }, (data, idtrash) => {
                    $A.state.crud.create('wous',  {
                        workspace_id: data.wowo_id,
                        user_id: $A.app.memFetch('user', true).id,
                        }, {
                        responseContainerId: containerId,
                        confirmationMessage: `You have been added as first team member.`,
                        }
                    );
                }); 
            } else {
                $A.state.crud.update('wowo',  data, {
                    responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                    confirmationMessage: $A.base.get(mapper,'confirmMessage', `WorkSpace Settings for: "${data.name.slice(0, 50)}..." have been updated.`),
                });
            }
        }
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

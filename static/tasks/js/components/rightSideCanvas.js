import $A from "../helper.js";

export default {
    default: {
        name: 'rightSideCanvas',
        mapper: [],
        cache: false,

        component: function (data, containerId, mapper) {
            const container = $A.dom.containerElement(containerId);
            const form = $A.dom.searchElementCorrectly('#' + container.id + 'Form', container);

            $A.app.handleScreenSizeAdjustments($A.data.screens.sm, () => {
                // make some room for keyboard in mobile views...
                let bufferDiv = $A.dom.makeDomElement('div', '', 'buffer');
                form.insertAdjacentElement('afterend', bufferDiv);
            });

            $A.tasks.forms.cleanTaskForm(form.id);
            //const saveButton = $A.dom.searchElementCorrectly('.save', form);
            //$A.state.dom.addMapperArguments(saveButton, 'form-id', form.id);
        }
    },
    
    save: {
        name: 'rightSideCanvas.save',
        mapper: ['formId'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let data = $A.tasks.forms.generateDictionaryFromForm(mapper.formId);
            data.visibility = 'private';
            data.status = 'assigned';
            data.assignee_id = $A.app.memFetch('user', true).id;
            data.assignor_id = $A.app.memFetch('user', true).id;
            
            $A.state.crud.create('tata',  data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                confirmationMessage: $A.base.get(mapper,'confirmMessage', `ToDo item "${data.description.slice(0, 30)}..." added.`),
            });
        }
    },
}

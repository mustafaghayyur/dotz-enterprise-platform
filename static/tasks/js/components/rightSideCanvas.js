import $A from "../helper.js";

export default {
    default: {
        fetch: function (mapper, containerId) {
            this.component({}, containerId, mapper);
        },

        name: 'rightSideCanvas',
        cache: false,

        component: function (data, containerId, mapper) {
            const container = $A.dom.containerElement(containerId);
            const form = $A.dom.searchElementCorrectly('#' + container.id + 'Form', container);
            const saveButton = $A.dom.searchElementCorrectly('#newTodoBtn', form);

            $A.app.handleScreenSizeAdjustments($A.data.screens.sm, () => {
                // make some room for keyboard in mobile views...
                let bufferDiv = $A.dom.makeDomElement('div', '', 'buffer');
                form.insertAdjacentElement('afterend', bufferDiv);
            });

            // @todo: make cleanTaskForm non-relient on KeysList...
            $A.tasks.forms.cleanTaskForm(container.id + 'Form');

            saveButton.addEventListener('click', (e) => {
                e.preventDefault();

                let dictionary = $A.tasks.forms.generateDictionaryFromForm(form.id);
                dictionary.visibility = 'private';
                dictionary.status = 'assigned';
                dictionary.assignee_id = $A.app.memFetch('user', true).id;
                dictionary.assignor_id = $A.app.memFetch('user', true).id;
                
                $A.query().create('tata', dictionary, true).execute('newTodoFormResponse', (data, containerId) => {
                    let response = container.querySelector('#' + containerId);

                    if ($A.generic.checkVariableType(response) !== 'domelement') {
                        throw Error('UI Error: Cannot find response container in newTodoForm operation.');
                    }

                    $A.app.generateResponseToAction(containerId, 'Your todo has been added.');
                });
            });
        }
    },
}

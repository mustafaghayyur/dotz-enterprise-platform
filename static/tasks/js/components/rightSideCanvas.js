import $A from "../helper.js";

export default function () {
    const container = $A.dom.obtainElementCorrectly('rightSideCanvas');
    const form = $A.dom.searchElementCorrectly('#newTodoForm', container);
    const saveButton = $A.dom.searchElementCorrectly('#newTodoBtn', form);

    if ($A.generic.checkVariableType(saveButton) !== 'domelement') {
        throw Error('UI Error: rightSideCanvas() cannot find valid todoForm Button.');
    }

    $A.app.handleScreenSizeAdjustments($A.data.screens.sm, () => {
        // make some room for keyboard in mobile views...
        let bufferDiv = $A.dom.makeDomElement('div', '', 'buffer');
        form.insertAdjacentElement('afterend', bufferDiv);
    });

    saveButton.addEventListener('click', (e) => {
        e.preventDefault();

        if ($A.generic.checkVariableType(form) !== 'domelement') {
            throw Error('UI Error: rightSideCanvas() cannot find valid todoForm element.');
        }

        let dictionary = $A.tasks.forms.generateDictionaryFromForm(form.id);
        dictionary.visibility = 'private';
        dictionary.status = 'assigned';
        dictionary.assignee_id = $A.app.memFetch('user', true).id;
        dictionary.assignor_id = $A.app.memFetch('user', true).id;
        console.log('inspecting todo creation', dictionary);
        
        $A.query().create('tata', dictionary, true).execute('newTodoFormResponse', (data, containerId) => {
            let response = container.querySelector('#' + containerId);

            if ($A.generic.checkVariableType(response) !== 'domelement') {
                throw Error('UI Error: Cannot find response container in newTodoForm operation.');
            }

            $A.app.generateResponseToAction(containerId, 'Your todo has been added.');
        });
    });
}
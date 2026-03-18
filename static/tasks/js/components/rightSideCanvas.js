import $A from "../helper.js";

export default function () {
    const container = document.getElementById('rightSideCanvas');
    //handleOffCanvasBehaviour(container);

    const form = container.querySelector('#newTodoForm');
    const saveButton = form.querySelector('#newTodoBtn');

    if ($A.generic.checkVariableType(saveButton) !== 'domelement') {
        throw Error('UI Error: rightSideCanvas() cannot find valid todoForm Button.');
    }

    saveButton.addEventListener('click', (e) => {
        e.preventDefault();

        if ($A.generic.checkVariableType(form) !== 'domelement') {
            throw Error('UI Error: rightSideCanvas() cannot find valid todoForm element.');
        }

        let dictionary = $A.tasks.forms.generateDictionaryFromForm(form.id);
        dictionary.visibility = 'private';
        dictionary.status = 'assigned';
        dictionary.assignee_id =  $A.app.memFetch('user_id');
        dictionary.assignor_id =  $A.app.memFetch('user_id');
        
        $A.query().create('tata', dictionary, true).execute('newTodoFormResponse', (data, containerId) => {
            let response = container.querySelector('#' + containerId);

            if ($A.generic.checkVariableType(response) !== 'domelement') {
                throw Error('UI Error: Cannot find response container in newTodoForm operation.');
            }

            response.textContent = 'Your todo has been added.';
        });
    });


    function handleOffCanvasBehaviour(container) {
        const largeScreenQuery = window.matchMedia(`(min-width: ${$A.data.screens.lg}px)`);
        const offcanvas = new bootstrap.Offcanvas(container);
        handleScreenChange(largeScreenQuery);
        largeScreenQuery.addEventListener('change', handleScreenChange);

        function handleScreenChange(mediaQuery) {
            if (mediaQuery.matches) {
                offcanvas.show();
            }
        }
    }
}
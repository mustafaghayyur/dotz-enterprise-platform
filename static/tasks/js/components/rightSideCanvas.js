import $A from "../helper.js";

export default function () {
    const conatiner = document.getElementById('rightSideCanvas');
    //handleOffCanvasBehaviour(conatiner);

    const form = conatiner.querySelector('#newTodoForm');
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
        
        $A.query().create('tata', dictionary, true).execute('newTodoFormResponse', (data, conatinerId) => {
            let response = conatiner.querySelector('#' + conatinerId);

            if ($A.generic.checkVariableType(response) !== 'domelement') {
                throw Error('UI Error: Cannot find response conatiner in newTodoForm operation.');
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
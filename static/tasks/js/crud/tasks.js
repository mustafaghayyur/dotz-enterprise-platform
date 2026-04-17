import $A from "../helper.js";

const TasksO2OKeys = $A.app.memFetch('o2oTaskFields', true);

/**
 * Allows submitted form to update existing record.
 * @param {str} formId: dom element id attr value for form 
 */
export function UpdateTask(formId, containerId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId, TasksO2OKeys);
    $A.query().edit('tata', dictionary, true).execute('taskEditModalResponse', (data, containerId) => {
        $A.app.generateResponseToAction(containerId, 'Your changes have been saved.');
    });
}

/**
 * Allows submitted form to create existing record.
 * @param {str} formId: dom element id attr value for form 
 */
export function CreateTask(formId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId, TasksO2OKeys);
    $A.query().create('tata', dictionary, true).execute('taskEditModalResponse', (data, containerId) => {
        $A.app.generateResponseToAction(containerId, 'Your Task/ToDo item has been saved.');
    });
}

/**
 * Allows submitted form to update existing record.
 * @param {str} formId: dom element id attr value for form 
 */
export function DeleteTask(taskId, identifyer) {
    if (!$A.forms.confirmDeletion(identifyer)) {
        return null;
    }

    $A.query().delete('tata', {
        tata_id: taskId
    }, true).execute('taskDetailsModalResponse', (data, containerId) => {
        $A.app.generateResponseToAction(containerId, 'Your Task/ToDo item has been removed.');
    });
}



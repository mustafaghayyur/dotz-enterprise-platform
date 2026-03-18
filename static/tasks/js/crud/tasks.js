import $A from "../helper.js";

const TasksO2OKeys = $A.app.memFetch('o2oTaskFields', true);

/**
 * Allows submitted form to update existing record.
 * @param {str} formId: dom element id attr value for form 
 */
export function UpdateTask(formId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId, TasksO2OKeys);
    $A.query().edit('tata', dictionary, true).execute('taskEditModalResponse', (data, containerId) => {
        let container = document.getElementById(containerId);

        container.textContent = 'Your changes have been saved.';
    });
}

/**
 * Allows submitted form to create existing record.
 * @param {str} formId: dom element id attr value for form 
 */
export function CreateTask(formId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId, TasksO2OKeys);
    $A.query().create('tata', dictionary, true).execute('taskEditModalResponse', (data, containerId) => {
        let container = document.getElementById(containerId);

        container.textContent = 'Your Task/ToDo item has been saved.';
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
        let container = $A.app.obtainElementCorrectly(containerId);
        container.textContent = 'Your Task/ToDo item has been removed.';
    });
}

/**
 * Changes ToDo item's status between 'assigned' and 'completed'
 * @param {str} todoId: database ID for task record.
 * @param {str} oldStatus: the status to remove
 */
export function toggleTodoStatus(record) {
    const allStatuses = 'assignedcompleted'; // @todo: find a better determining operation
    const newStatus = allStatuses.replace(record.status, '');

    const dictionary = {
        tata_id: record.tata_id,
        tast_id: record.tast_id,
        status: newStatus
    };

    $A.query().edit('tata', dictionary, true).execute('personalTodosResponse', (data, containerId) => {
        let container = document.getElementById(containerId);

        container.textContent = 'Your ToDo item has been updated.';
    });
}

/**
 * Deletes a Todo based on id provided.
 * @param {int} todoId: database ID for task to delete
 * @param {string} identifyer: any term to identify the ToDo to user during confirmation. 
 */
export function deleteTodo(todoId, identifyer) {
    if (!$A.forms.confirmDeletion(identifyer)) {
        return null;
    }

    $A.query().delete('tata', {
        tata_id: todoId
    }, true).execute('personalTodosResponse', (data, containerId) => {
        let container = document.getElementById(containerId);

        container.textContent = 'Your ToDo has been removed.';
    });
}

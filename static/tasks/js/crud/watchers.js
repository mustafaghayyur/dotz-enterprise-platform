import $A from "../helper.js";

/**
 * Creates a new record in the back-end for current user as watcher of supplied task id.
 * @param {int} taskId: database ID for task in question
 * @param {str} watchBtnId: html dom element id attr value
 * @param {str} unwatchBtnId: html dom element id attr value
 */
export function createWatcher(taskId, watchBtnId, unwatchBtnId){    
    let watchbtn = document.getElementById(watchBtnId);
    let unwatchbtn = document.getElementById(unwatchBtnId);

    const dictionary = {
        task_id: taskId,
    };

    $A.query().create('tawa', dictionary, true).execute('taskDetailsModalResponse', (data, containerId) => {
            watchbtn.classList.add('d-none');
            unwatchbtn.classList.remove('d-none');
            $A.app.generateResponseToAction(containerId, 'Added to watcher list.');
        });
}

/**
 * Removes existing record in the back-end for current user as watcher of supplied task id.
 * @param {int} taskId: database ID for task in question
 * @param {str} watchBtnId: html dom element id attr value
 * @param {str} unwatchBtnId: html dom element id attr value
 */
export function removeWatcher(taskId, watchBtnId, unwatchBtnId){
    let watchbtn = document.getElementById(watchBtnId);
    let unwatchbtn = document.getElementById(unwatchBtnId);

    const dictionary = {
        task_id: taskId,
    };

    $A.query().delete('tawa', dictionary, true).execute('taskDetailsModalResponse', (data, containerId) => {
            watchbtn.classList.remove('d-none');
            unwatchbtn.classList.add('d-none');
            $A.app.generateResponseToAction(containerId, 'Removed from watcher list.');
        });
}


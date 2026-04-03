/**
 * Handles current state of user watching task
 * 
 * @param {arr} data: api data 
 * @param {str} containerId 
 */
export default function(data, containerId) {
    let constainer = $A.dom.containerElement(containerId);
    let watchBtn = $A.dom.seachElementCorrectly('addWatcher', constainer);
    let unwatchBtn = $A.dom.seachElementCorrectly('removeWatcher', constainer);

    if ($A.generic.isVariableEmpty(data)) {
        watchBtn.classList.remove('d-none');
        unwatchBtn.classList.add('d-none');
    } else {
        unwatchBtn.classList.remove('d-none');
        watchBtn.classList.add('d-none');
    }

    // add event listeners of watch buttons...
    $A.app.wrapEventListeners(watchbtn, 'data-task-id', task.tata_id, 'click', async (e) => {
        e.preventDefault();
        const taskId = e.currentTarget.getAttribute('data-task-id');
        createWatcher(taskId, 'addWatcher', 'removeWatcher');
    });

    $A.app.wrapEventListeners(unwatchbtn, 'data-task-id', task.tata_id, 'click', async (e) => {
        e.preventDefault();
        const taskId = e.currentTarget.getAttribute('data-task-id');
        removeWatcher(taskId, 'addWatcher', 'removeWatcher');
    });
}
import $A from "../../helper.js";

/**
 * Handles current state of user watching task
 * 
 * @param {arr} data: api data 
 * @param {str} containerId 
 */
export default {
    fetch: {
        default: function (mapper, containerId, componentName) {
            // fetch logic will be added here
        }
    },

    component: {
        default: function(data, containerId) {
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

            $A.state.dom.addMapperArguments(watchBtn, 'task-id', data.task_id);
            $A.state.dom.addMapperArguments(unwatchBtn, 'task-id', data.task_id);

            // add event listeners of watch buttons...
            $A.app.eventListener('click', watchBtn, async (e) => {
                e.preventDefault();
                const taskId = e.currentTarget.dataset.stateMapperTaskId;
                $A.state.crud.create('tawa', { task_id: taskId }, container, (resp, conId) => {
                    watchBtn.classList.add('d-none');
                    unwatchBtn.classList.remove('d-none');
                    $A.app.generateResponseToAction(conId, 'Added to watcher list.');
                });
            });

            $A.app.eventListener('click', unwatchBtn, async (e) => {
                e.preventDefault();
                const taskId = e.currentTarget.dataset.stateMapperTaskId;
                $A.state.crud.delete('tawa', { task_id: taskId }, container, (resp, conId) => {
                    watchBtn.classList.remove('d-none');
                    unwatchBtn.classList.add('d-none');
                    $A.app.generateResponseToAction(containerId, 'Removed from watcher list.');
                });
            });
        }
    }
}

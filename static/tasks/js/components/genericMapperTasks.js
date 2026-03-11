import $A from "../helper.js";

/**
 * Tasks Mapper: matches TaskMapper keys to returned data keys, and embeds data.
 * Keys must be from Tasks Mapper.
 * Keys must be defined in containerId dom element's children elements.
 */
export default function(data, containerId) {
    let container = $A.app.containerElement(containerId);
    const taskKeys = $A.app.memFetch('allTaskFields');
    
    if ($A.generic.checkVariableType(container) !== 'domelement') {
        throw new Error('genericMapperTasks() could not find containerId in DOM.')
    }

    if ($A.generic.checkVariableType(taskKeys) !== 'list') {
        throw new Error('TaskKeys could not be fetched in genericMapperTasks().')
    }

    taskKeys.forEach((key) => {
        let elem = container.querySelector('.embed.' + key);
        elem.innerHTML = $A.forms.escapeHtml(value);
        return elem;
    });
};

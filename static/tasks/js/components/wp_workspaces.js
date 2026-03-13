import $A from "../helper.js";


export default (data, containerId) => {
    let container = $A.app.containerElement(containerId);
    
    data.forEach((itm) => {
        let elem = $A.app.makeDomElement('div', 'workspace-tab', itm.wowo_id + '-workspace');
        let heading = $A.app.makeDomElement('h4');
        heading.textContent = $A.forms.escapeHtml(itm.name);
        elem.setAttribute('data-wp-id', itm.wowo_id);
        let desc = $A.app.makeDomElement('div', 'small');
        desc.textContent = $A.forms.escapeHtml(itm.description);
        elem.appendChild(heading);
        elem.appendChild(desc);
        container.appendChild(elem);
    });

    $A.dashboard('tasksDashboard', {});
}

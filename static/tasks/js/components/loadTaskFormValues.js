import $A from "../helper.js";

/**
 * Fetches appropriate values for Task Edit Form.
 * @todo: see why these queries are called multiple times with one click.
 * 
 * @param {obj|str} taskInfo: full task record to edit | or string carrying current workspace_id
 */
export default (taskInfo) => {
    if ($A.generic.checkVariableType(taskInfo) !== 'dictionary' || $A.generic.isVariableEmpty(taskInfo)) {
        if (!$A.generic.isPrimitiveValue(taskInfo)) {
            throw Error('Error FA099: WorkSpace id must be provided in primitive data value format.')
        }
        taskInfo = {
            workspace_id: taskInfo
        };
    }
    
    // task list for workspace
    $A.query().search('tata').fields('tata_id', 'description').where({
            workspace_id: taskInfo['workspace_id'],
        }).order([{tbl:'tata', col: 'id', sort: 'desc'}])
        .execute('taskEditModalResponse', embedTasksDataIntoForm);

    // users for workspace
    $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name'
        ).join({
            'left|usus_id': 'wous_user_id',
        }).where({
            wous_workspace_id: taskInfo['workspace_id'],
        }).order([
            {tbl:'usus', col: 'last_name', sort: 'asc'},
            {tbl:'usus', col: 'first_name', sort: 'asc'}
        ]).translate({ debug: true })
        .execute('taskEditModalResponse', embedUsersDataIntoForm);


    /**
     * Embeds the data from query into form Select Fields.
     * For Task Ids
     * @param {obj} data 
     * @param {str} containerId 
     */
    function embedTasksDataIntoForm(data, containerId) {
        let container = $A.app.containerElement(containerId);
        let select = container.querySelector('form select[name="parent_id"]');

        if ($A.generic.checkVariableType(select) !== 'domelement') {
            throw Error('Error FA004: Cannot find Task Parent Select Field.');
        }

        if ($A.generic.checkVariableType(data) !== 'list') {
            throw Error('Error FA005: Cannot parse data object.');
        }

        data.forEach((itm) => {
            let elem = $A.app.makeDomElement('option');
            elem.textContent = itm.description;
            elem.value = itm.tata_id;
            if (taskInfo.parent_id === itm.tata_id) {
                elem.setAttribute("selected", "true");
            }
            select.appendChild(elem);
        });
    }

    /**
     * Embeds the data from query into form Select Fields.
     * For User Ids
     * @param {obj} data 
     * @param {str} containerId 
     */
    function embedUsersDataIntoForm(data, containerId) {
        let container = $A.app.containerElement(containerId);
        let select1 = container.querySelector('form select[name="assignor_id"]');
        let select2 = container.querySelector('form select[name="assignee_id"]');

        if ($A.generic.checkVariableType(select1) !== 'domelement') {
            throw Error('Error FA001: Cannot find Assignor Select Field.');
        }

        if ($A.generic.checkVariableType(select2) !== 'domelement') {
            throw Error('Error FA002: Cannot find Assignee Select Field.');
        }

        if ($A.generic.checkVariableType(data) !== 'list') {
            throw Error('Error FA003: Cannot parse data object.');
        }

        data.forEach((itm) => {
            let elem1 = $A.app.makeDomElement('option');
            elem1.textContent = itm.first_name + ' ' + itm.last_name + ' (@' + itm.username + ')';
            elem1.value = itm.usus_id;

            if (taskInfo.assignor_id === itm.usus_id) {
                elem1.setAttribute("selected", "true");
            }

            let elem2 = elem1.cloneNode(true);
            if (taskInfo.assignee_id === itm.usus_id) {
                elem2.setAttribute("selected", "true");
            }

            select1.appendChild(elem1);
            select2.appendChild(elem2);
        });
    }
}

import $A from "../helper.js";

/**
 * Enabled all features in Task Edit Form.
 * 
 * @param {obj|str} taskInfo: full task record to edit | or string carrying current workspace_id
 */
export default (wowoData) => {
    let container = $A.dom.obtainElementCorrectly('workSpaceEditModal');
    let deptsField = $A.dom.searchElementCorrectly('form select[name="department_id"]', container);
    let depts = Array.from(deptsField.selectedOptions);
    const currentDepts = depts.map(option => option.value);
    console.log('Checking currentDepts', currentDepts);

    // Prefill form with workspace data if provided
    if (wowoData && $A.generic.checkVariableType(wowoData) === 'dictionary') {
        $A.forms.prefillForms(wowoData, 'workSpaceEditForm');
    }

    $A.app.handleScreenSizeAdjustments($A.data.screens.sm, () => {
        // make some room for keyboard in mobile views...
        let form = $A.dom.searchElementCorrectly('form', container);
        let bufferDiv = $A.dom.makeDomElement('div', '', 'buffer');
        form.insertAdjacentElement('afterend', bufferDiv);
    });

    // departments list for workspace @todo: narrow to current user's horizons?
    $A.query().search('dede').fields('dede_id', 'name').order([{tbl:'dede', col: 'id', sort: 'desc'}])
        .execute('workSpaceEditModalResponse', embedDepartmentsDataIntoForm);

    /*$A.app.wrapEventListeners(deptsField, 'data-current-depts', currentDepts, 'change', (e) => {
        const list = e.currentTarget.getAttribute('data-current-depts');
        if ($A.generic.checkVariableType(list) === 'list' && list.length > 0) {
            // users for workspace
            $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name'
                ).join({
                    'left|usus_id': 'deus_user_id',
                }).where({
                    deus_department_id: list,
                    user_level: '>' + $A.data.user.levels.leader // @todo: add gt/lt operators to conditions
                }).order([
                    {tbl:'usus', col: 'last_name', sort: 'asc'},
                    {tbl:'usus', col: 'first_name', sort: 'asc'}
                ]).execute('workSpaceEditModalResponse', embedUsersDataIntoForm);
        }
    });*/

    // users for workspace
    $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name')
        .order([
            {tbl:'usus', col: 'last_name', sort: 'asc'},
            {tbl:'usus', col: 'first_name', sort: 'asc'}
        ]).execute('workSpaceEditModalResponse', embedUsersDataIntoForm);

    

    // Edit Task Modal: Save Operations Setup...
    const editTaskSaveBtn = $A.dom.obtainElementCorrectly('workSpaceEditFormSaveBtn');
    const wowo_id = $A.dom.searchElementCorrectly('#workSpaceEditForm input[name="wowo_id"]', container);
    $A.app.wrapEventListeners(editTaskSaveBtn, 'data-workspace-id', wowo_id.value, 'click', (e) => {
        e.preventDefault();
        const wowoId = e.currentTarget.getAttribute('data-workspace-id');
        if ($A.generic.isVariableEmpty(wowoId)) {
            $A.query().create('wowo', 'workSpaceEditForm', false).execute('workSpaceEditModalResponse', (data, containerId) => {
                const response = $A.dom.obtainElementCorrectly(containerId);
                response.textContent = `Your workspace entry has been saved.`;
            });
        } else {
            $A.query().update('wowo', 'workSpaceEditForm', false).execute('workSpaceEditModalResponse', (data, containerId) => {
                const response = $A.dom.obtainElementCorrectly(containerId);
                response.textContent = `Your workspace changes have been saved.`;
            });
        }
    });

    $A.app.wrapEventListeners(container, 'xx', null, 'hide.bs.modal', (e) => {
        if (!$A.forms.confirm('close WorkSpace Edit Panel', 'Any unsaved data will be lost.')) {
            e.preventDefault();
            return null;
        }
    });

    /**
     * Embeds the data from query into form Select Fields.
     * For Department Ids
     * @param {obj} data 
     * @param {str} containerId 
     */
    function embedDepartmentsDataIntoForm(data, containerId) {
        let container = $A.dom.containerElement(containerId);
        let select = container.querySelector('form select[name="department_id"]');

        if ($A.generic.checkVariableType(select) !== 'domelement') {
            throw Error('Error FB004: Cannot find Department Select Field.');
        }

        if ($A.generic.checkVariableType(data) !== 'list') {
            throw Error('Error FB005: Cannot parse data object.');
        }

        data.forEach((itm) => {
            let elem = $A.dom.makeDomElement('option');
            elem.textContent = itm.name;
            elem.value = itm.dede_id;
            select.appendChild(elem);
        });
    }

    /**
     * Embeds the data from query into form Select Fields.
     * For User Ids (Team Leader)
     * @param {obj} data 
     * @param {str} containerId 
     */
    function embedUsersDataIntoForm(data, containerId) {
        let container = $A.dom.containerElement(containerId);
        let select = container.querySelector('form select[name="lead_id"]');

        if ($A.generic.checkVariableType(select) !== 'domelement') {
            throw Error('Error FB001: Cannot find Team Leader Select Field.');
        }

        if ($A.generic.checkVariableType(data) !== 'list') {
            throw Error('Error FB003: Cannot parse data object.');
        }

        data.forEach((itm) => {
            let elem = $A.dom.makeDomElement('option');
            elem.textContent = `${itm.first_name} ${itm.last_name} (@${itm.username})`;
            elem.value = itm.usus_id;
            select.appendChild(elem);
        });
    }
    
}

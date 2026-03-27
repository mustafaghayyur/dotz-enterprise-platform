import $A from "../helper.js";

const WorkSpaceO2OKeys = $A.app.memFetch('o2oWorkSpaceFields', true);

/**
 * Allows submitted form to update existing record.
 * @param {str} formId: dom element id attr value for form 
 */
export function UpdateWorkSpace(formId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId, WorkSpaceO2OKeys);
    $A.query().edit('wowo', '', false).execute('workSpaceEditModalResponse', (data, containerId) => {
        $A.app.generateResponseToAction(containerId, `Your WorkSpace changes have been saved.`);
        UpdateDepartmentsInWorkSpace('workSpaceEditForm');
        UpdateLeaderInWorkSpace('workSpaceEditForm');
    });
}

/**
 * Allows submitted form to create existing record.
 * @param {str} formId: dom element id attr value for form 
 */
export function CreateWorkSpace(formId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId);
    $A.query().create('wowo', dictionary, true).execute('workSpaceEditModalResponse', (data, containerId) => {
        $A.app.generateResponseToAction(containerId, `Your WorkSpace has been created.`);
        AddDepartmentsToWorkSpace('workSpaceEditForm');
        AddLeaderToWorkSpace('workSpaceEditForm');
    });
}

/**
 * Allows submitted form to update existing record.
 * @param {str} formId: dom element id attr value for form 
 */
export function DeleteWorkSpace(wowoId, identifyer) {
    if (!$A.forms.confirm(`close ${identifyer}`, 'This action will cause severe interruptions to existing Task cycles. The WorkSpace will remain open for 24 hours post closing to allow smoothe transition.')) {
        return null;
    }

    // @todo: implement 'closing procedure with 24 shut-down time.'
    /*$A.query().delete('wowo', {
        wowo_id: wowoId
    }, true).execute('workSpaceEditModalResponse', (data, containerId) => {
        let container = $A.dom.obtainElementCorrectly(containerId);
        $A.app.generateResponseToAction(containerId, 'Your WorkSpace will be closed in 24hrs.');
    });*/
}

export function AddDepartmentsToWorkSpace (formId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId);
    $A.query().create('wode', dictionary, true).execute('workSpaceEditModalResponse', (data, containerId) => {
        $A.app.generateResponseToAction(containerId, `Departments added to WorkSpace.`);
    });
}

export function AddLeaderToWorkSpace (formId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId);
    $A.query().create('wous', dictionary, true).execute('workSpaceEditModalResponse', (data, containerId) => {
        $A.app.generateResponseToAction(containerId, `Team Leader added to WorkSpace.`);
    });
}

export function UpdateDepartmentsInWorkSpace (formId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId);
    $A.query().edit('wode', dictionary, true).execute('workSpaceEditModalResponse', (data, containerId) => {
        $A.app.generateResponseToAction(containerId, `Departments added to WorkSpace.`);
    });
}

export function UpdateLeaderInWorkSpace (formId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId);
    $A.query().edit('wous', dictionary, true).execute('workSpaceEditModalResponse', (data, containerId) => {
        $A.app.generateResponseToAction(containerId, `Team Leader added to WorkSpace.`);
    });
}





import $A from "../../helper.js";
import { UpdateWorkSpace, CreateWorkSpace, UpdateDepartmentsInWorkSpace, UpdateLeaderInWorkSpace, AddDepartmentsToWorkSpace, AddLeaderToWorkSpace } from '../../crud/workspaces.js';
//import { fetchDepartmentsForWorkSpace, fetchUsersForDepartment } from '../../crud/fetchDefault.js';

/**
 * Handles Adding Team Members/Leaders to WorkSpace
 * 
 * @param {obj|str} taskInfo: full task record to edit | or string carrying current workspace_id
 */
export default {
    fetch: {
        default: function (mapper, containerId, componentName) {
            // fetch logic will be added here
        }
    },

    component: {
        default: function(wowoData) {
            let container = $A.dom.obtainElementCorrectly('workSpaceUsersEditModal');
            let deptsField = $A.dom.searchElementCorrectly('form select[name="department_id"]', container);

            // allowed departments' list for workspace...
            fetchDepartmentsForWorkSpace('currentDepartmentsResponse', 'ws_embedDepartmentsData');

            $A.app.wrapEventListeners(deptsField, 'data-current-depts', null, 'change', (e) => {
                let depts = Array.from(e.currentTarget.selectedOptions);
                const currentDepts = depts.map(option => option.value);
                if ($A.generic.checkVariableType(currentDepts) === 'list' && currentDepts.length > 0) {
                    fetchUsersForDepartment('workSpaceEditModalResponse', 'ws_embedUsersDataIntoForm');
                }
            });

            // Save Operations Setup (Edit WorkSpace Modal)...
            const editTaskSaveBtn = $A.dom.obtainElementCorrectly('workSpaceEditFormSaveBtn');
            const wowo_id = $A.dom.searchElementCorrectly('#workSpaceEditForm input[name="wowo_id"]', container);
            $A.app.wrapEventListeners(editTaskSaveBtn, 'data-workspace-id', wowo_id.value, 'click', (e) => {
                e.preventDefault();
                const wowoId = e.currentTarget.getAttribute('data-workspace-id');
                if ($A.generic.isVariableEmpty(wowoId)) {
                    CreateWorkSpace('workSpaceEditForm');
                } else {
                    UpdateWorkSpace('workSpaceEditForm');
                }
            });

            // handle modal close confirmation...
            $A.app.wrapEventListeners(container, 'null', null, 'hide.bs.modal', (e) => {
                if (!$A.forms.confirm('close WorkSpace Users Panel', 'Any unsaved data will be lost.')) {
                    e.preventDefault();
                    return null;
                }
            });
        }
    }
}

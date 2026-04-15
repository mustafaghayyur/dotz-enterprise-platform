import $A from "../../helper.js";
//import _ from 'lodash';
import Sortable from 'sortablejs';

/**
 * For Team Leaders: 
 * Dashboard to mamange project cyles, tasks and priorities.
 * 
 * @param (*) data: API resultset retrieved by worspace API call in ws_workspaces.js.
 * @param (str) containerId: DOM element ID where response would be displayed.
 */
export default {
    default: {
        fetch: function (mapper, containerId) {
            $A.query().search('tata').fields('tata_id', 'description', 'status', 'assignee_id', 'assignor_id', 'creator_id', 'tata_create_time', 'tata_update_time')
                .where({
                    workspace_id: mapper.workspace.wowo_id,
                    tata_delete_time: 'is null'})
                .execute(containerId, this, mapper.workspace);
        },

        name: 'workspaceManagementDashboard',
        mapper: ['workspace'],
        tbls: ['wowo', 'tata'],
        identifier: ['wowo_id'],

        component: function(data, containerId, workspace) {
            let container = $A.dom.containerElement(containerId);
            const taskTermSortables = $A.dom.searchAllElementsCorrectly('.sortable', container);
            
            taskTermSortables.forEach((card) => {
                if ($A.generic.checkVariableType(card) !== 'domelement') {
                    throw Error('UI Error: Sortable failed to pickout cards.');
                }
                new Sortable(card, {
                    group: 'taskTerms', // set both lists to same group
                    animation: 150,
                    ghostClass: 'ghost-style-one'
                });
            });
        }
    },
}

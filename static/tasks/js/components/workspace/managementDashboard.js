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
    fetch: {
        default: function (mapper, containerId, componentName) {
            // fetch logic will be added here
        }
    },

    component: {
        default: function(data, containerId) {
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
    }
}

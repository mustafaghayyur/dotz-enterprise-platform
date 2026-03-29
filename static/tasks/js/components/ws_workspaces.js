//import _ from 'lodash';
import $A from "../helper.js";
import { DeleteWorkSpace } from '../crud/workspaces.js';
import { fetchTasksForWorkSpaceArena } from '../crud/fetchDefault.js';

/**
 * Implements the entire Tasks' WorkSpaces Dashboard.
 * All workspaces are displayed as sub-tabs.
 * Each work-space-tab carries complete app to manage workspace.
 * 
 * @param (*) data: API resultset retrieved by worspace API call in main.js.
 * @param (str) containerId: DOm element ID where response would be displayed.
 */
export default async (data, containerId) => {
    let container = $A.dom.containerElement(containerId);

    const TasksO2OKeys = $A.app.memFetch('o2oTaskFields', true);
    let tabs = $A.dom.searchElementCorrectly('.nav-tabs', container);
    let panes = $A.dom.searchElementCorrectly('.tab-content', container);
    let tabTemplate = $A.dom.searchElementCorrectly('.nav-tabs .nav-item', container);
    let paneTemplate = $A.dom.searchElementCorrectly('.tab-content .tab-pane', container);
    let WSArenaCallBackStack = {};
    const workspaceEditForm = await $A.tasks.load('ws_ProjectEditForm');


    //reset the tabs and panes so new tabs/panes can be added.
    tabs.innerHTML = '';
    panes.innerHTML = '';
    let isDefault = false;
    let i = 0;

    data.forEach((itm) => {
        const tabKey = `WOWOitm-${itm.wowo_id}`;

        if (i === 0) {
            isDefault = true;
        }

        tabs.appendChild($A.ui.makeNewTab(tabTemplate, tabKey, itm.name, isDefault));
        panes.appendChild($A.ui.makeNewPane(paneTemplate, tabKey, isDefault));
        i++;

        const paneContainer = $A.dom.searchElementCorrectly(`#pane-${tabKey}`, panes);
        let btns = $A.dom.searchAllElementsCorrectly(`#ws-navbar .nav-link`, paneContainer);
        btns.forEach((btn) => {
            btn.setAttribute('data-wowo-id', itm.wowo_id);

            if (btn.id === 'newWorkSpaceTask') {
                btn.addEventListener('click', async ()=>{        
                    $A.tasks.forms.cleanTaskForm('taskEditForm', TasksO2OKeys);
                    const taskEditForm = await $A.tasks.load('taskEditForm');
                    taskEditForm(itm.wowo_id);
                });
            }
        });

        editAndDeleteWorkSpaces(itm, paneContainer);

        // define callbacks for each WS tab
        WSArenaCallBackStack[tabKey] = () => {
            fetchTasksForWorkSpaceArena(tabKey, itm, 'workspacesDashboardResponse', 'ws_projectArena');
        }
    });

    // finally implement the Tabed (sub) Dashboard for WorkSPaces-Arena
    $A.dashboard('wsTabs', WSArenaCallBackStack);

    /**
     * Implements edit and delete functionality for WorkSPaces.
     * @param {*} workspace: data for workspace
     * @param {*} container: DOM element for current pane.
     */
    function editAndDeleteWorkSpaces(workspace, container) {
        const editBtn = document.getElementById('editWorkSpaceBtn');
        editBtn.addEventListener('click', async (e) => {
            workspaceEditForm(workspace);
        });

        const deleteBtn = document.getElementById('deleteWorkSpace');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            DeleteWorkSpace(workspace.wowo_id, 'WorkSpace with id #' + workspace.wowo_id);
        });
    }
}

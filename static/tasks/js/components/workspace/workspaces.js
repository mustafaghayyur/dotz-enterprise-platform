import $A from "../../helper.js";

/**
 * Implements the entire Tasks' WorkSpaces Dashboard.
 * All workspaces are displayed as sub-tabs.
 * Each work-space-tab carries complete app to manage workspace.
 * 
 * @param (*) data: API resultset retrieved by worspace API call in main.js.
 * @param (str) containerId: DOm element ID where response would be displayed.
 */
export default {
    fetch: {
        default: function (mapper, containerId, componentName) {
            // fetch logic will be added here
        }
    },

    component: {
        default: async function(data, containerId) {
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
                const arenaComponent = $A.dom.searchElementCorrectly(`#workspaceProjectArena`, paneContainer);
                arenaComponent.dataset.stateKey = `workspaceProjectArena-${tabKey}`;
                arenaComponent.dataset.stateInitialize = false;
                arenaComponent.dataset.stateComponent = `workspaceProjectArena`;

                const managementComponent = $A.dom.searchElementCorrectly(`#workspaceManagementDashboard`, paneContainer);
                arenaComponent.dataset.stateKey = `workspaceManagementDashboard-${tabKey}`;
                arenaComponent.dataset.stateInitialize = false;
                arenaComponent.dataset.stateComponent = `workspaceManagementDashboard`;
                
                let btns = $A.dom.searchAllElementsCorrectly(`#ws-navbar .nav-link`, paneContainer);
                btns.forEach((btn) => {
                    btn.setAttribute('data-wowo-id', itm.wowo_id);

                    if (btn.id === 'newWorkSpaceTask') {
                        $A.state.dom.addMapperArguments(btn, 'wowo-id', itm.wowo_id);
                        $A.state.dom.eventListener('click', btn, async (e) => {
                            const wowoId = e.currentTarget.dataset.stateMapperWowoId;
                            $A.state.trigger('workspaceProjectEditForm', itm);
                        });
                    }
                });

                editAndDeleteWorkSpaces(itm, paneContainer);

                // define callbacks for each WS tab
                WSArenaCallBackStack[tabKey] = () => {
                    $A.state.trigger(`workspaceProjectArena-${tabKey}`, {
                        tabKey: tabKey,
                        workSpaceInfo: itm,
                    });
                }
            });

            // finally implement the Tabed (sub) Dashboard for WorkSPaces-Arena
            $A.dashboard('wsTabs', WSArenaCallBackStack, false);

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
                    if (!$A.forms.confirm(`close ${identifyer}`, 'This action will cause severe interruptions to existing Task cycles. The WorkSpace will remain open for 24 hours post closing to allow smoothe transition.')) {
                        e.preventDefault();
                        return null;
                    }
                    // implement some day...
                    // $A.state.crud.delete('wowo', { wowo_id: wowoId }, container);
                });
            }
        }
    }
}

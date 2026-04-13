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
    default: {
        // mapper.user_id = $A.app.memFetch('user', true).id
        fetch: function (mapper, containerId) {
            $A.query().search('wowo')
                    .fields('wowo_id', 'name', 'description', 'type', 'creator', 'create_time')
                    .where({
                        user_id: mapper.user_id,
                        wowo_delete_time: 'is null',
                    })
                    .order([
                        {tbl: 'wowo', col: 'id', sort: 'desc'},
                    ]).page(1).execute(containerId, this);
        },
        name: 'workspaceWorkspaces',
        identifier: ['user_id'],
        tbls: ['wowo'],


        component: async function(data, containerId) {
            let container = $A.dom.containerElement(containerId);

            const TasksO2OKeys = $A.app.memFetch('o2oTaskFields', true);
            let tabs = $A.dom.searchElementCorrectly('.nav-tabs', container);
            let panes = $A.dom.searchElementCorrectly('.tab-content', container);
            let tabTemplate = $A.dom.searchElementCorrectly('.nav-tabs .nav-item', container);
            let paneTemplate = $A.dom.searchElementCorrectly('.tab-content .tab-pane', container);
            let WSArenaCallBackStack = {};


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
                arenaComponent.dataset.stateMapperTabKey = tabKey;
                arenaComponent.dataset.stateInitialize = false;

                const managementComponent = $A.dom.searchElementCorrectly(`#workspaceManagementDashboard`, paneContainer);
                managementComponent.dataset.stateMapperTabKey = tabKey;
                managementComponent.dataset.stateInitialize = false;
                
                let btns = $A.dom.searchAllElementsCorrectly(`#ws-navbar .nav-link`, paneContainer);
                btns.forEach((btn) => {
                    btn.setAttribute('data-wowo-id', itm.wowo_id);

                    if (btn.id === 'newWorkSpaceTask') {
                        $A.state.dom.addMapperArguments(btn, 'wowo-id', itm.wowo_id);
                        $A.state.dom.eventListener('click', btn, async (e) => {
                            const wowoId = e.currentTarget.dataset.stateMapperWowoId;
                            await $A.state.call('workspaceProjectEditForm', itm);
                        });
                    }
                });

                $A.state.call('workspaceWorkspaces.editAndDelete', {workspace: itm, tabKey: tabKey});

                // define callbacks for each WS tab
                WSArenaCallBackStack[tabKey] = () => {
                    $A.state.call(`workspaceProjectArena`, {
                        tabKey: tabKey,
                        workspace: itm,
                        parent: paneContainer,
                    });
                }
            });

            // finally implement the Tabed (sub) Dashboard for WorkSPaces-Arena
            $A.dashboard('wsTabs', WSArenaCallBackStack, false);
        }
    },

    editAndDelete: {
        fetch: function (mapper, containerId) {
            this.component({}, containerId, mapper);
        },
        name: 'workspaceWorkspaces.editAndDelete',
        cache: false,

        /**
         * Implements edit and delete functionality for WorkSPaces.
         * @param {*} data: null
         * @param {*} container: DOM element for current pane.
         * @param {*} mapper: info for workspace
         */
        component: async function (data, containerId, mapper) {
            const container = $A.dom.containerElement(containerId);
            const paneContainer = $A.dom.searchElementCorrectly(`#pane-${mapper.tabKey}`, container);

            const editBtn = $A.dom.searchElementCorrectly('#editWorkSpaceBtn', paneContainer);
            editBtn.addEventListener('click', async (e) => {
                $A.state.call('workspaceProjectEditForm', mapper.workspace);
            });

            const deleteBtn = $A.dom.searchElementCorrectly('#deleteWorkSpace', paneContainer);
            deleteBtn.addEventListener('click', (e) => {
                if (!$A.forms.confirm(`close ${mapper.workspace.name}`, 'This action will cause severe interruptions to existing Task cycles. The WorkSpace will remain open for 24 hours post closing to allow for a smoothe transition.')) {
                    e.preventDefault();
                    return null;
                }
                // implement some day...
                // $A.state.crud.delete('wowo', { wowo_id: wowoId }, container);
            });
        }
    }
}

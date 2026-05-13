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
        fetch: function (mapper, containerId) {
            return $A.query().search('wowo')
                .fields('wowo_id', 'name', 'description', 'type', 'wowo_create_time', 'start', 'end', 'interval_length', 'interval_type', 'life_cycle_type')
                .where({ user_id: mapper.user_id,
                    wowo_delete_time: 'is null', })
                .order([ {tbl: 'wowo', col: 'id', sort: 'desc'}, ])
                .page(1)
                .execute(containerId, this, mapper);
        },
        name: 'workspaceWorkspaces',
        mapper: ['user_id'],
        identifier: ['user_id'],
        tbls: ['wowo'],

        component: async function(data, containerId) {
            if ($A.base.not(data, 'list')) {
                throw Error('UI Error: Inside workspaceWorkspaces component - provided data not in array format.');
            }
            let container = $A.dom.containerElement(containerId);
            let tabs = $A.dom.searchElementCorrectly('.nav-tabs', container);
            let panes = $A.dom.searchElementCorrectly('.tab-content', container);
            let tabTemplate = $A.dom.searchElementCorrectly('.nav-tabs .nav-item', tabs);
            let paneTemplate = $A.dom.searchElementCorrectly('.tab-content .tab-pane', panes);
            let WSArenaCallBackStack = {};

            //reset the tabs and panes so new tabs/panes can be added.
            tabs.innerHTML = '';
            panes.innerHTML = '';
            let isDefault = false;
            let i = 0;

            // make fragments for tabs and panes
            let tabsFragment = document.createDocumentFragment();
            let panesFragment = document.createDocumentFragment();

            data.forEach(async (workspace) => {
                const tabKey = `WOWOitm-${workspace.wowo_id}`;

                isDefault = (i === 0);
                let tab = $A.ui.makeNewTab(tabTemplate, tabKey, workspace.name, isDefault);
                let paneContainer = $A.ui.makeNewPane(paneTemplate, tabKey, isDefault);
                tabsFragment.appendChild(tab);
                panesFragment.appendChild(paneContainer);
                $A.dom.componentDomInstance('workspaceProjectArena', tabKey, paneContainer);
                $A.dom.componentDomInstance('workspaceManagementDashboard', tabKey, paneContainer);
                
                let btns = $A.dom.searchAllElementsCorrectly(`#ws-navbar .nav-link`, paneContainer);
                btns.forEach((btn) => {
                    btn.setAttribute('data-state-mapper-wowo-id', workspace.wowo_id);
                    btn.setAttribute('data-state-mapper-workspace', $A.base.stringify(workspace, false));
                    if (btn.id === 'manageWorkSpace' || btn.id === 'manageArena') {
                        btn.setAttribute('data-state-mapper-container-parts', tabKey);
                        btn.setAttribute('data-state-mapper-parent', paneContainer.id);
                    }
                });

                // define callbacks for each WS tab
                WSArenaCallBackStack[tabKey] = async () => {
                    await $A.state.call(`workspaceProjectArena`, {
                        containerParts: tabKey,
                        workspace: workspace,
                        parent: paneContainer.id,
                    });
                }
                i++;
            });

            // append the dynamically generated tabs and panes to the container
            tabs.appendChild(tabsFragment);
            panes.appendChild(panesFragment);
            // finally implement the Tabbed (sub) Dashboard for WorkSPaces-Arena
            $A.dashboard('wsTabs', WSArenaCallBackStack, false);

            // reposition + New Space btn to end of tabs list
            const newSpaceBtn = $A.dom.searchElementCorrectly('.new-workspace-tab', container);
            tabs.appendChild(newSpaceBtn);
            newSpaceBtn.classList.remove('position-absolute');
            newSpaceBtn.style.position = 'static';

            // finally, fix all WS tabs to account for text-length
            const tabBtns = $A.dom.searchAllElementsCorrectly('.tab.nav-link', tabs);
            tabBtns.forEach((tabBtn) => {
                const textLength = tabBtn.textContent.length;
                if (textLength >= 86) {
                    // 86+ chars: 30% of original
                    tabBtn.style.fontSize = 'calc(0.8rem * 0.5)';
                    tabBtn.style.lineHeight = 'calc(1.42 * 0.6)';
                } else if (textLength >= 56) {
                    // 56-85 chars: 50% reduction
                    tabBtn.style.fontSize = 'calc(0.8rem * 0.7)';
                    tabBtn.style.lineHeight = 'calc(1.42 * 0.7)';
                }
            });
        }
    },
}

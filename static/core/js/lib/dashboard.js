import $A from "../helper.js";

/**
 * Implements a tabbed dashboard of REST endpoints
 */
export function TabbedDashBoard(containerId, callbackFunctions, singleCall = true) {
    const dashboard = document.getElementById(containerId);
    
    if ($A.generic.checkVariableType(dashboard) !== 'domelement') {
        throw Error('UI Error: Dashboard containerId not found: ' + cintainerId);
    }

    const tabsContainer = dashboard.querySelector('.nav-tabs');
    const panesContainer = dashboard.querySelector('.tab-content');

    if ($A.generic.checkVariableType(tabsContainer) !== 'domelement' || $A.generic.checkVariableType(panesContainer) !== 'domelement') {
        throw Error('UI Error: Dashboard containerId not found: ' + cintainerId);
    }

    const allTabs = tabsContainer.querySelectorAll('.tab.nav-link');
    const tabs = Array.from(allTabs).filter(tab => tab.closest('.nav-tabs') === tabsContainer);

    if (tabs && tabs.length < 1) {
        throw Error('UI Error: Dashboard tabs not found: ' + tabs);
    }

    let called = {};

    /**
     * Central element of tabbled dashboards.
     * @param {string} tabName: from the "#tab-{something}" pass the {something} 
     */
    function setActiveTab(tabName) {
        tabs.forEach(tab => {
            let name = tab.dataset.tabName;
            let pane = panesContainer.querySelector('#pane-' + name);
            if (pane && pane.closest('.tab-content') !== panesContainer) pane = null;
            
            if (name === tabName) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected','true');
                pane.classList.add('active');
                if ($A.generic.checkVariableType(callbackFunctions[name]) === 'function' && called[name] === false) {
                    if (singleCall) {
                        called[name] = true;
                    }
                    callbackFunctions[name]();
                }
            } else {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected','false');
                pane.classList.remove('active');
            }
        });
    }

    /**
     * This sets the event handler for tables loading data
     */
    tabs.forEach(tab => {
        let name = tab.dataset.tabName;
        let extra = tab.dataset.extra;
        called[name] = false;

        tab.addEventListener('click', () => {
            setActiveTab(name);
        });

        if (extra === 'default') {
            tab.click(); // trigger default  tab
        }
    });
}


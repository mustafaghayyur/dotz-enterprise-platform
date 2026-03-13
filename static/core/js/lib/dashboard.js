import $A from "../helper.js";

/**
 * Implements a tabbed dashboard of REST endpoints
 */
export function TabbedDashBoard(containerId, callbackFunctions, singleCall = true) {
    const dashboard = document.getElementById(containerId);
    
    if ($A.generic.checkVariableType(dashboard) !== 'domelement') {
        throw Error('UI Error: Dashboard containerId not found: ' + cintainerId);
    }

    const tabs = dashboard.querySelectorAll('.tab.nav-link');

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
            let pane = dashboard.querySelector('#pane-' + name);
            if (name === tabName) {
                console.log('Inspecting Dashboard...', name, pane, tabName, called);
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


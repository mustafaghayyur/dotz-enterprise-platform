import $A from "../helper.js";

export default {
    /**
     * Embeds provided API data into matching .embed.{key} nodes of containerId.
     * Does NOT create new nodes.
     * 
     * @param {*} data: api data reultset
     * @param {str} containerId: dom HTML element id (without the '#' prefix). Or actual node instance with 'actualNode' flag set to true
     * @param {bool} actualNode: true if actual DOM node is being passed in container.
     */
    embedData: function(data, containerId, actualNode = false) {
        const typeData = $A.generic.checkVariableType(data);
        let container = containerId;

        if (typeData !== 'list' && typeData !== 'dictionary') {
            throw Error('UI Error: Data provided to embedData() not valid list or dictionary.');
        }

        if (actualNode === false) {
            container = $A.dom.containerElement(containerId);
        }

        if (typeData === 'list') {            
            data.forEach((itm) => {
                if ($A.generic.checkVariableType(itm) === 'dictionary') {
                    $A.generic.loopObject(itm, (key, value) => {
                        let elem = container.querySelector('.embed.' + key);
                        $A.ui.displayValueCorrectly(key, value, elem);
                    });
                }
            });
        }

        if (typeData === 'dictionary') {
            $A.generic.loopObject(data, (key, value) => {
                let elem = container.querySelector(`.embed.${key}`);
                $A.ui.displayValueCorrectly(key, value, elem);
            });
        }

        return container;
    },

    displayValueCorrectly: function (key, value, elem) {
        if ($A.generic.checkVariableType(elem) === 'domelement') {
            if ($A.forms.hasDateTimeData(key, value)) {
                elem.textContent = $A.dates.convertToDisplayLocal(value, null, 'None');
            } else {
                elem.textContent = $A.forms.escapeHtml(value);
            }
        }
    },

    /**
     * Generates new Tab Button Node based on provided template, with appropriate settings.
     * 
     * @param {domElement} paneNodeTemplate: Pane Node to use as template. Must ahve valid keys/nodes.
     * @param {str} key: key to sub into Pane code.
     * @param {str} name: Full name to display in Tab Button content.
     * @param {bool} isDefault: should we treat this Pane as active? 
     * @returns HTML DOM node for Tab btn.
     */
    makeNewTab: function (tabNodeTemplate, key, name, isDefault = false) {
        let clone = tabNodeTemplate.cloneNode(true);

        if ($A.generic.checkVariableType(clone) !== 'domelement') {
            throw Error('DOM Error: Dom element clone for makeNewTab() not valid.');
        }

        let btn = $A.dom.searchElementCorrectly('.tab.nav-link', clone);
        
        // here we set all the variables...
        const extraText = isDefault ? 'default' : '';
        const active = isDefault ? 'active' : '';
        const selected = isDefault ? 'true' : 'false';

        btn.setAttribute('id', `tab-${key}-btn`);
        btn.classList.add(active);
        btn.setAttribute('data-tab-name', key);
        btn.setAttribute('aria-controls', `pane-${key}`);
        btn.setAttribute('aria-selected', selected);
        btn.setAttribute('data-extra', extraText);
        btn.textContent = name;
        clone.appendChild(btn);
        clone.classList.remove('d-none');

        return clone;
    },

    /**
     * Generates new Pane Node based on provided template, with appropriate settings.
     * Note: only returns '.tab-pane' node, if found.
     * 
     * @param {domElement} paneNodeTemplate: Pane Node to use as template. Must ahve valid keys/nodes.
     * @param {str} key: key to sub into Pane code.
     * @param {bool} isDefault: should we treat this Pane as active? 
     * @returns HTML DOM node for Pane.
     */
    makeNewPane: function (paneNodeTemplate, key, isDefault = false) {
        let pane = paneNodeTemplate.cloneNode(true);
        
        if ($A.generic.checkVariableType(pane) !== 'domelement') {
            throw Error('DOM Error: Dom element pane for makeNewPane() not valid.');
        }
        
        let results = $A.dom.searchElementCorrectly('.tab-results', pane);
        
        // here we set all the variables...
        const active = isDefault ? 'active' : '';
        pane.setAttribute('id', `pane-${key}`);
        pane.classList.remove('d-none');
        pane.classList.add(active);
        pane.setAttribute('aria-labelledby', `tab-${key}-btn`);
        results.setAttribute('id', `${key}Container`);

        pane.appendChild(results);

        return pane;
    },

    /**
     * If the data supplied to component is empty of non-array, this method takes
     * appropriate measures.
     * 
     * @param {*} data: supplied via API
     * @param {*} elem: html node that will container the data
     */
    handleEmptyData: function (data, elem) {
        if ($A.generic.checkVariableType(data) !== 'list') {
            throw Error(`UI Error: "${elem.id}}" View did not receive a valid array.`);
        }
        if (!$A.generic.isVariableEmpty(data)) {
            elem.textContent = '';
        }
    }
};


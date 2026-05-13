import $A from "../helper.js";

export default {
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

        if ($A.base.not(clone, 'domelement')) {
            throw Error('DOM Error: Dom element clone for makeNewTab() not valid.');
        }

        let btn = $A.dom.searchElementCorrectly('.tab.nav-link', clone);

        // here we set all the variables...
        const extraText = isDefault ? 'default' : '';
        const selected = isDefault ? 'true' : 'false';

        btn.setAttribute('id', `tab-${key}-btn`);
        if (isDefault) { btn.classList.add('active'); }
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

        if ($A.base.not(pane, 'domelement')) {
            throw Error('DOM Error: Dom element pane for makeNewPane() not valid.');
        }

        let results = $A.dom.searchElementCorrectly('.tab-results', pane);

        // here we set all the variables...
        pane.setAttribute('id', `pane-${key}`);
        pane.classList.remove('d-none');
        if (isDefault) { pane.classList.add('active'); }
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
        if ($A.base.not(data, 'list')) {
            throw Error(`UI Error: "${elem.id}}" View did not receive a valid array.`);
        }
        if (!$A.base.empty(data)) {
            elem.textContent = '';
        }
    },

    enableCollapseToggle: function (panesGroupId, toggleBtnClass, container) {
        if ($A.base.not(container, 'domelement')) { container = document; }
        document.addEventListener('show.bs.collapse', function (e) {
            if (e.target.closest('#' + panesGroupId)) {
                const targetId = e.target.id;
                document.querySelectorAll('.' + toggleBtnClass, container).forEach(btn => {
                    if (btn.getAttribute('data-bs-target') === '#' + targetId) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        });
    },

    confirmFormClose: function (container) {
        // handle modal close confirmation...
        $A.app.eventListener('hide.bs.modal', container, (e) => {
            let modal = e.currentTarget;
            if (!modal.classList.contains('form-modal')) { return null; }
            if (!$A.forms.confirm('close this Edit Panel', 'Any unsaved data will be lost.')) {
                e.preventDefault();
                return null;
            }
        });
    },
};


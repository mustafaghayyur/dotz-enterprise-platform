import $A from "../helper.js";

export default {
    /**
     * confirms any deletion before the event.
     * @param {string} identifyer
     * @returns true if deletion is to continue | false otherwise
     * 
     * @todo: implement
     */
    confirmDeletion: function (identifyer) {
        const confirmed = confirm(`Are you sure you want to delete this: [${identifyer}]? Action cannot be undone.`);
        if (confirmed) {
            return true
        } else {
            return false
        }
    },

    /**
     * Generic confirmation panel
     * 
     * @param {*} identifyer: identify item being confirmed.
     * @param {*} message: additional message for clarity.
     * @returns bool
     */
    confirm: function (identifyer, message = '') {
        const confirmed = confirm(`Are you sure you want to: ${identifyer}? ${message}`);
        if (confirmed) {
            return true
        } else {
            return false
        }
    },
    /**
     * Cleans all fields inside form matching formId.
     *
     * @param {string} formId: should be the while id value along with the '#' selector
     * @param {boolean} revertToHtmlDefaults: If true, it restores the form to its original HTML state (including structural DOM changes if a snapshot was captured).
     */
    cleanForm: function (formId, revertToHtmlDefaults = true) {
        const form = $A.dom.obtainElementCorrectly(formId);
        
        // 1. If we have a captured inception DOM snapshot, restore the exact HTML structure
        if (revertToHtmlDefaults && form._inceptionDomState) {
            form.innerHTML = form._inceptionDomState;
            $A.state.events.activateTriggers(form);
        }

        form.reset(); // Reverts to default

        // we forcefully wipe values (legacy behavior)
        if (!revertToHtmlDefaults) {
            Array.from(form.elements).forEach(element => {
                if (element.type !== 'submit' && element.type !== 'button') {
                    element.value = ''; // Force empty
                    element.checked = false; // Uncheck radio/checkboxes
                }
            });
        }
    },

    /**
     * Captures a snapshot of the form's HTML DOM right after it was created.
     * This allows cleanForm() to revert any structural changes (classes, inserted divs) made by JS later.
     */
    snapshotInceptionState: function (formId) {
        const form = $A.dom.obtainElementCorrectly(formId, false);
        if (form && !form._inceptionDomState) {
            form._inceptionDomState = form.innerHTML;
        }
    },

    /**
     * Helps prevent xss attacks. 
     * Django should be performing this check.
     * @todo: improve...
     * @param {string} str: string to escape 
     * @returns 
     */
    escapeHtml: function (str) {
        return String(str).replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
    },

    /**
     * Forms a dictionary/object of key/value pairs from the form.
     * 
     * @param {string} formId: should be string html id attribute value
     * @param {*} keysList: optional list of keys to check/validate
     */
    formToDictionary: function (formId) {
        const form = document.getElementById(formId);

        if (!(form instanceof HTMLElement)) {
            throw Error('Error: form could not be found. Cannot form request object.', form);
        }

        // 1. Create a FormData object from the form element
        const formData = new FormData(form);

        // 2. Convert the FormData entries into a plain JavaScript object (dictionary format)
        const formObject = Object.fromEntries(formData.entries());

        let dictionary =  $A.base.loop(formObject, (key, value) => {    
            // basic conversion of primitive data types to null if they are an empty string
            return $A.validators.primitivesToNull(formObject[key]);
        });

        return dictionary; // return validated data
    },

    /**
     * Pre-populate a form with record details using keys list.
     * @param {object} data: the data-object which will fill the form fields.
     * @param {str} formId: html dom id attr value 
     */
    prefillForms: function (data, formId) {
        const form = $A.dom.obtainElementCorrectly(formId); // Get the form element

        $A.base.loop(data, (key, value) => {
            const field = form.elements[key];

            if (!value || !field) {
                return; // @todo: should I have better handling here? What about missing values for fields?
            }

            if ($A.forms.hasDateTimeData(key, value)) {
                field.value = $A.dates.convertToDateTimeToLocalField(value);  // convert to appropriate format first
                return;
            }

            field.value = value;
        });
    },

    /**
     * Determines if field is a DateTime type.
     * 
     * @todo: improve this function
     * @param {str} key: inidvidual key name which should correlate with a Model column name in Django.
     * @param {str} value: value to be used for determination
     * @returns 
     */
    hasDateTimeData: function (key, value) {
        return /(_time$)|deadline/.test(key);
    }
};

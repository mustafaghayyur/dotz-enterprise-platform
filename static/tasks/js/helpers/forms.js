import $A from "../helper.js";

export default {
    /**
     * A helper function.
     * This function simply pre-populates the Edit Task Form with record details, for which it was invoked.
     * @param {object} data: the data-object which will fill the form fields.
     */
    prefillEditForm: (data, keys = null) => {
        return $A.forms.prefillForms(data, 'taskEditForm');
    },

    /**
     * Wrapper for clean function.
     * @param {string} formId: should be the html Id attr value 
     */
    cleanTaskForm: (formId, keys) => {
        $A.forms.cleanForm(formId, keys);
    },

    /**
     * Forms a dictionary/object of key/value pairs from the form.
     * Then performs validation checks on them and returns a dictionary.
     * 
     * @param {string} formId: should be string html id attribute value
     * @param {list} keys: optional list of keys to check/validate
     */
    generateDictionaryFromForm: (formId, keys = null) => {
        let dictionary = $A.forms.formToDictionary(formId);

        if ($A.generic.checkVariableType(keys) === 'list') {
            keys.forEach(key => {    
                if (dictionary[key]) {
                    dictionary[key] = $A.tasks.validators.validate(dictionary[key]);
                }
            });
        }
        return dictionary;
    }
};
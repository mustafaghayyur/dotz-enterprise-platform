import $A from "../helper.js";

export default {
    dates: function(date) {

    },
    strings: function(string) {

    },
    numbers: function(number) {

    },
    booleans: function(bool) {

    },
    nulls: function(value) {

    },
    /**
     * This method only replaces empty strings with nulls for all primitive data types.
     * Boolean false is not empty.
     * @param {*} value: primitive value to validate  
     * @returns null || value
     */
    primitivesToNull: function(value) {
        if ($A.generic.isPrimitiveValue(value)) {
            if ($A.generic.isVariableEmpty(value)) {
                return null;
            }
        }
        return value;
    }
};
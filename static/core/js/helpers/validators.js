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
        if ($A.base.isPrimitive(value)) {
            if ($A.base.empty(value)) {
                return null;
            }
        }
        return value;
    }
};
import $A from "../helper.js";

export default {
    text: function (text, selector, start = 0, end = null, container = document) {
        let field = $A.dom.searchElementCorrectly(selector, container);
        end = end || text.length;
        let formatted = text.substring(start, end)
        field.textContent = formatted + '..';
    }
};


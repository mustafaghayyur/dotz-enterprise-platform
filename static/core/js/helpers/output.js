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
    embedData: function (data, containerId, actualNode = false) {
        const typeData = $A.base.type(data);
        let container = containerId;

        if (typeData !== 'list' && typeData !== 'dictionary') {
            throw Error('UI Error: Data provided to embedData() not valid list or dictionary.');
        }

        if (actualNode === false) {
            container = $A.dom.containerElement(containerId);
        }

        if (typeData === 'list') {
            data.forEach((itm) => {
                if ($A.base.is(itm, 'dictionary')) {
                    $A.base.loop(itm, (key, value) => {
                        let elem = container.querySelector('.embed.' + key);
                        this.displayValueCorrectly(key, value, elem);
                    });
                }
            });
        }

        if (typeData === 'dictionary') {
            $A.base.loop(data, (key, value) => {
                let elem = container.querySelector(`.embed.${key}`);
                this.displayValueCorrectly(key, value, elem);
            });
        }

        return container;
    },

    displayValueCorrectly: function (key, value, elem) {
        if ($A.base.is(elem, 'domelement')) {
            if ($A.forms.hasDateTimeData(key, value)) {
                elem.textContent = $A.dates.convertToDisplayLocal(value, null, 'None');
            } else {
                elem.textContent = $A.forms.escapeHtml(value);
            }
        }
    },

    text: function (text, start = 0, end = null) {
        end = end || text.length;
        return text.substring(start, end)
    },

    /**
     * Embeds a formatted version of the provided text into the specified element.
     * @param {str} text: string to format
     * @param {list} range: [start[int], end[int]] - range of characters to keep from original text. If not provided, defaults to entire string.
     * @param {str} selector: CSS selector to find the element to embed text into, within the container.
     * @param {HTMLElement} container: DOM element to search within for the selector. Defaults to entire document.
     */
    embedText: function (text, range, selector, container = document) {
        if ($A.base.not(range, 'list')) { range = [0, null]; }
        let formatted = this.text(text, range[0], range[1]);
        let field = $A.dom.searchElementCorrectly(selector, container);
        field.textContent = formatted + '..';
    },

};


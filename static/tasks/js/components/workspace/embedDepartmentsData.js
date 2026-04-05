/**
 * Embeds the data from query into form Select Fields.
 * For Department Ids
 * @param {obj} data 
 * @param {str} containerId 
 */
export default {
    fetch: {
        default: function (mapper, containerId, componentName) {
            // fetch logic will be added here
        }
    },

    component: {
        default: function(data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let originalLiItem = $A.dom.searchElementCorrectly('li.list-group-item', container);
            container.innerHTML = '';

            if ($A.generic.checkVariableType(data) !== 'list') {
                throw Error('Data Error: Cannot find departments for workspace.');
            }

            data.forEach((itm) => {``
                let li = originalLiItem.cloneNode(true);
                li.dataset.deptId = $A.forms.escapeHtml(item.dede_id);
                li.textContent = $A.forms.escapeHtml(item.dede_name);
                
                container.appendChild(li);
            });
        }
    }
}

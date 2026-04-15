/**
 * @param {obj} data 
 * @param {str} containerId 
 */
export default {
    default: {
        fetch: function (mapper, containerId) {
            $A.query().search('wode').fields('wode_id', 'dede_name')
                .join({'left|department_id': 'dede_id'})
                .where({'workspace_id': mapper.wowo_id})
                .order([{tbl:'ded', col: 'dede_name', sort: 'desc'}])
                .execute(containerId, component);
        },

        name: 'workspaceDepartments',
        mapper: ['wowo_id'],
        tbls: ['wode', 'dede', 'wowo'],
        identifier: ['wowo_id'],

        component: function(data, containerId) {
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
    },
}

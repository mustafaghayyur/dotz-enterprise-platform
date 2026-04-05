/**
 * Embeds the data from query into form Select Fields.
 * For User Ids (Team Leader)
 * @param {obj} data 
 * @param {str} containerId 
 */
export default {
    fetch: {
        default: function (mapper, containerId, componentName) {
            $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name'
                ).join({
                    'left|usus_id': 'deus_user_id',
                }).where({
                    deus_department_id: currentDepts,
                    user_level: [10, 20, 30, 40, 50] // + $A.data.user.levels.leader // @todo: add gt/lt operators to conditions
                }).order([
                    {tbl:'usus', col: 'last_name', sort: 'asc'},
                    {tbl:'usus', col: 'first_name', sort: 'asc'}
                ]).page(1, 1000)
                .execute(containerId, component);
        }
    },

    component: {
        default: function(data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let select = container.querySelector('form select[name="lead_id"]');

            if ($A.generic.checkVariableType(select) !== 'domelement') {
                throw Error('Error FB001: Cannot find Team Leader Select Field.');
            }

            if ($A.generic.checkVariableType(data) !== 'list') {
                throw Error('Error FB003: Cannot parse data object.');
            }

            // reset form...
            select.innerHTML = '';
            const users = removeDuplicateUsers(data);

            users.forEach((itm) => {
                let elem = $A.dom.makeDomElement('option');
                elem.textContent = `${itm.first_name} ${itm.last_name} (@${itm.username})`;
                elem.value = itm.usus_id;
                select.appendChild(elem);
            });


            /**
             * Removes duplicates from list
             * 
             * @param {arr} usersList 
             * @returns list
             */
            function removeDuplicateUsers(usersList) {
                if (!$A.generic.checkVariableType(usersList) === 'list') {
                    return [];
                }
                const seen = new Set();
                const finalList = usersList.filter((user) => {
                    if (!$A.generic.checkVariableType(user) === 'dictionary') {
                        return false;
                    }
                    if (user.usus_id == null) {
                        return false;
                    }

                    if (seen.has(user.usus_id)) {
                        return false;
                    }

                    seen.add(user.usus_id);
                    return true;
                });

                return finalList;
            }
        }
    }
}

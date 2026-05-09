import $A from "../../helper.js";

export default {
    /**
     * This pane will hold departments, team leaders and members' settings for workspace.
     * Needs proper UI to select active departments for WorkSPace.
     * Then select team members from department-members list.
     */
    default: {
        name: 'workspaceTeams',
        mapper: ['workspace'],
        cache: false,
        component: async function(data, containerId, mapper) {
            let workspace = mapper.workspace; 
            let container = $A.dom.containerElement(containerId);
            let form = $A.dom.searchElementCorrectly('#workspaceUserSettingsForm', container);
            let select = form.querySelector('select[name="department_id"]');
            let usersPane = $A.dom.searchElementCorrectly('#workspaceUserListsContainer', container);
            
            const miniFields = form.querySelectorAll('.mini-field-wrapper');
            if (miniFields.length > 1) {
                miniFields[1].classList.add('d-none'); // hide the team members select field
            }
            
            select.setAttribute('data-state-trigger', 'workspaceTeams.onDepartmentChange');
            select.setAttribute('data-state-trigger-event', 'change');

            // fetch initial departments list for workspace...
            await $A.state.call('workspaceTeams.embedDepartments', {mockery: 1});
            await $A.state.call('workspaceTeams.markCurrentDepartments', { wowoId: workspace.wowo_id });
        }
    },

    /**
     * Simply fetches all departments in system. Then populates list in multi-select form field.
     */
    embedDepartments: {
        fetch: function(mapper, containerId) {
            return $A.query().search('dede').fields('dede_id', 'name', 'parent_id')
                .order([{tbl:'dede', col: 'id', sort: 'desc'}])
                .execute(containerId, this, mapper);
        },
        name: 'workspaceTeams.embedDepartments',
        tbls: ['dede'],
        identifier: ['mockery'],
        component: function (departments, containerId) {
            let container = $A.dom.containerElement(containerId);
            let select = container.querySelector('form select[name="department_id"]');
            let fragment = document.createDocumentFragment();

            if ($A.base.not(select, 'domelement')) {
                throw Error('Error: Cannot find Department Select Field.');
            }
            if ($A.base.not(departments, 'list')) {
                throw Error('Error: Cannot parse retrieved data object.');
            }

            departments = $A.forms.makeHierarchicalTree(departments, 'name', 'dede_id');

            departments.forEach((dept) => {
                let elem = $A.dom.makeDomElement('option');
                elem.textContent = dept.name;
                elem.value = dept.dede_id;
                fragment.appendChild(elem);
            });

            select.appendChild(fragment);
        },
    },
    

    /**
     * Marks all current departments associated with WorkSpace, as selected in departments select field.
     */
    markCurrentDepartments: {
        fetch: function (mapper, containerId) {
            $A.query().search('wode').fields('wode_id', 'department_id')
                .where({'wowo_id': mapper.wowoId})
                .order([{tbl:'wode', col: 'id', sort: 'desc'}])
                .execute(containerId, this, mapper);
        },
        name: 'workspaceTeams.markCurrentDepartments',
        mapper: ['wowoId'],
        tbls: ['wode', 'dede', 'wowo'],
        identifier: ['wowoId'],
        component: function(data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let select = container.querySelector('form select[name="department_id"]');
            
            if ($A.base.not(select, 'domelement')) {
                throw Error('Form Error: Cannot find Department Select Field.');
            }
            if ($A.base.not(data, 'list')) {
                throw Error('Data Error: Cannot find departments for workspace.');
            }

            const departmentIds = data
                .filter((item) => $A.base.is(item, 'dictionary') && item.department_id != null)
                .map((item) => Number(item.department_id))
                .filter((id) => !Number.isNaN(id));

            select.querySelectorAll('option').forEach((option) => {
                const optionValue = Number(option.value);
                if (!Number.isNaN(optionValue) && departmentIds.includes(optionValue)) {
                    option.selected = true;
                }
            });
        }
    },

    fetchUsers: {
        fetch: function (mapper, containerId) {
            $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name')
                .join({ 'left|usus_id': 'deus_user_id', })
                .where({ deus_department_id: mapper.currentDepts,
                    user_level: '[between]10|50{and}' })
                .order([ {tbl:'usus', col: 'last_name', sort: 'asc'},
                    {tbl:'usus', col: 'first_name', sort: 'asc'} ])
                .page(1, 1000).translate({debug: true})
                .execute(containerId, this, mapper);
        },
        name: 'workspaceTeams.fetchUsers',
        mapper: ['currentDepts'],
        tbls: ['usus', 'deus'],
        identifier: ['currentDepts'],

        component: async function(data, containerId) {
            console.log('fetched users for selected departments...');
            let container = $A.dom.containerElement(containerId);
            let allUsersList = $A.dom.searchElementCorrectly('#allUsersList', container);
            let item = $A.dom.searchElementCorrectly('.user-item', allUsersList);
            let fragment = document.createDocumentFragment();
            if ($A.base.not(data, 'list')) {
                throw Error('Data Error: Cannot parse data object.');
            }

            // fill all users list with fetched users based on selected departments. This list will be used to select team members for workspace.
            allUsersList.innerHTML = '';
            const users = sort(data);
            console.log('sorted users list...', users);
            users.forEach((user) => {
                let elem = item.cloneNode(true);
                elem.classList.remove('d-none');
                elem.dataset.ususId = user.usus_id;
                elem.querySelector('.name-info').textContent = `${user.first_name} ${user.last_name} (@${user.username})`;
                fragment.appendChild(elem);
            });
            allUsersList.appendChild(fragment);


            /**
             * Removed duplicate users from list based on usus_id value. 
             * Also ensures that all items in list are dictionaries and have usus_id key.
             * @param {array} usersList 
             * @returns 
             */
            function sort(usersList) {
                if ($A.base.not(usersList, 'list')) { return []; }
                const seen = new Set();
                const finalList = usersList.filter((user) => {
                    if ($A.base.not(user, 'dictionary')) { return false; }
                    if (user.usus_id == null) { return false; }
                    if (seen.has(user.usus_id)) { return false; }
                    seen.add(user.usus_id);
                    return true;
                });
                return finalList;
            }
        }
    },

    onDepartmentChange: {
        name: 'workspaceTeams.onDepartmentChange',
        cache: false,
        component: async function(trash, containerId, mapper) {
            console.log('triggered fetch users for selected departments...');
            let container = $A.dom.containerElement(containerId);
            let deptsField = [...$A.dom.searchAllElementsCorrectly('form select[name="department_id"] option', container)];
            const currentDepts = deptsField.filter(option => option.selected).map(option => option.value);
            if ($A.base.is(currentDepts, 'list') && currentDepts.length > 0) {
                await $A.state.call('workspaceTeams.fetchUsers', { currentDepts });
            }
            return null;
        }
    },
}

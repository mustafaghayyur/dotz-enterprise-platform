import $A from "../../helper.js";

export default {
    /**
     * This pane will hold departments, team leaders and members' settings for workspace.
     * Needs proper UI to select active departments for WorkSPace.
     * Then select team members from department-members list.
     */
    default: {
        name: 'workspaceTeamMemberSettings',
        mapper: ['workspace'],
        refresh: false,
        cache: false,
        component: async function(data, containerId, mapper) {
            let workspace = mapper.workspace; 
            let container = $A.dom.containerElement(containerId);
            let formId = 'workspaceUserSettingsForm';
            let form = $A.dom.searchElementCorrectly('#' + formId, container);
            let usersPane = $A.dom.searchElementCorrectly('#workspaceUserListsContainer', container);
            const miniFields = form.querySelectorAll('.mini-field-wrapper');
            if (miniFields.length > 1) {
                miniFields[1].classList.add('d-none');
            }
            //miniFields[1].parentElement.appendChild(usersPane);

            // departments list for workspace...
            await $A.state.call('workspaceTeamMemberSettings.embedDepartments', {wowoId: workspace.wowo_id});
        }
    },

    /**
     * Simply fetches all departments in system. Then populates list in multi-select form field.
     */
    embedDepartments: {
        fetch: function(mapper, containerId) {
            return $A.query().search('dede').fields('dede_id', 'name')
                .order([{tbl:'dede', col: 'id', sort: 'desc'}])
                .execute(containerId, this, mapper);
        },
        name: 'workspaceTeamMemberSettings.embedDepartments',
        tbls: ['dede'],
        identifier: ['wowoId'],
        component: function (departments, containerId) {
            let container = $A.dom.containerElement(containerId);
            let select = container.querySelector('form select[name="department_id"]');

            if ($A.base.not(select, 'domelement')) {
                throw Error('Error: Cannot find Department Select Field.');
            }
            if ($A.base.not(departments, 'list')) {
                throw Error('Error: Cannot parse retrieved data object.');
            }

            departments.forEach((dept) => {
                let elem = $A.dom.makeDomElement('option');
                elem.textContent = dept.name;
                elem.value = dept.dede_id;
                select.appendChild(elem);
            });
        }
    },

    fetchUsers: {
        fetch: function (mapper, containerId) {
            $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name')
                .join({ 'left|usus_id': 'deus_user_id', })
                .where({ deus_department_id: mapper.currentDepts,
                    user_level: '[between]1|50{and}' })
                .order([ {tbl:'usus', col: 'last_name', sort: 'asc'},
                    {tbl:'usus', col: 'first_name', sort: 'asc'} ])
                .page(1, 1000).translate({debug: true})
                .execute(containerId, this, mapper);
        },
        name: 'workspaceTeamMemberSettings.fetchUsers',
        mapper: ['currentDepts'],
        tbls: ['usus', 'deus'],
        identifier: ['currentDepts'],

        component: async function(data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let select = container.querySelector('form select[name="lead_id"]');

            if ($A.base.not(select, 'domelement')) {
                throw Error('Error FB001: Cannot find Team Leader Select Field.');
            }

            if ($A.base.not(data, 'list')) {
                throw Error('Error FB003: Cannot parse data object.');
            }

            // reset form...
            select.innerHTML = '';
            const users = await $A.state.call('workspaceTeamMemberSettings.removeDuplicateUsers', { users: data });

            users.forEach((itm) => {
                let elem = $A.dom.makeDomElement('option');
                elem.textContent = `${itm.first_name} ${itm.last_name} (@${itm.username})`;
                elem.value = itm.usus_id;
                select.appendChild(elem);
            });
        }
    },

    /**
     * Removes duplicates from list
     */
    removeDuplicateUsers: {
        name: 'workspaceTeamMemberSettings.removeDuplicateUsers',
        mapper: [['users', 'list']],
        cache: false,
        component: function(trash, containerId, mapper) {
            let usersList = mapper.users;
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
    },

    onChangeFetchUsers: {
        name: 'workspaceTeamMemberSettings.addUsers',
        mapper: ['workspace'],
        cache: false,
        component: async function(trash, containerId, mapper) {
            let workspace = mapper.workspace;
            let container = $A.dom.containerElement(containerId);

            let deptsField = $A.dom.searchElementCorrectly('form select[name="department_id"]', container);
            const currentDepts = deptsField.map(option => option.value);
            if ($A.base.is(currentDepts, 'list') && currentDepts.length > 0) {
                await $A.state.call('workspaceTeamMemberSettings.fetchUsers', { currentDepts });
            }
            return null;
        }
    },
    

    /**
     * Marks all current departments associated with WorkSpace, as selected in departments select field.
     */
    markCurrentDepartments: {
        fetch: function (mapper, containerId) {
            $A.query().search('wode').fields('wode_id', 'department_id')
                .where({'workspace_id': mapper.wowoId})
                .execute(containerId, this, mapper);
        },
        name: 'workspaceTeamMemberSettings.markCurrentDepartments',
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
}

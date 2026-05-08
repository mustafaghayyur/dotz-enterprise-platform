import $A from "../../helper.js";

export default {
    /**
     * This pane will hold departments and team leaders related settings for workspace.
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


            // departments list for workspace...
            await $A.state.call('workspaceTeamMemberSettings.embedDepartmentsData');
        }
    },

    fetchUsers: {
        fetch: function (mapper, containerId) {
            $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name'
                ).join({
                    'left|usus_id': 'deus_user_id',
                }).where({
                    deus_department_id: mapper.currentDepts,
                    user_level: [10, 20, 30, 40, 50] // + $A.data.user.levels.leader // @todo: add gt/lt operators to conditions
                }).order([
                    {tbl:'usus', col: 'last_name', sort: 'asc'},
                    {tbl:'usus', col: 'first_name', sort: 'asc'}
                ]).page(1, 1000)
                .execute(containerId, this, mapper);
        },
        name: 'workspaceTeamMemberSettings.fetchUsers',
        mapper: ['currentDepts'],
        tbls: ['usus', 'deus'],
        identifier: ['currentDeptsJoined'], // @todo: how should arrays be used a sidentifiers?

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
        mapper: ['users'],
        cache: false,
        component: function(data, containerId, mapper) {
            let usersList = mapper.users;

            if ($A.base.not(usersList, 'list')) {
                return [];
            }
            const seen = new Set();
            const finalList = usersList.filter((user) => {
                if ($A.base.not(user, 'dictionary')) {
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
    },

    addUsers: {
        name: 'workspaceTeamMemberSettings.addUsers',
        mapper: ['workspace'],
        cache: false,

        component: async function(data, containerId, mapper) {
            let workspace = mapper.workspace;
            let container = $A.dom.containerElement(containerId);
            let deptsField = $A.dom.searchElementCorrectly('form select[name="department_id"]', container);

            // allowed departments' list for workspace...
            await $A.state.call('workspaceTeamMemberSettings.embedDepartmentsData');

            $A.app.wrapEventListeners(deptsField, 'data-current-depts', null, 'change', async (e) => {
                let depts = Array.from(e.currentTarget.selectedOptions);
                const currentDepts = depts.map(option => option.value);
                if ($A.base.is(currentDepts, 'list') && currentDepts.length > 0) {
                    await $A.state.call('workspaceTeamMemberSettings.embedDepartmentsData');
                }
            });

            // Save Operations Setup (Edit WorkSpace Modal)...
            const editTaskSaveBtn = $A.dom.obtainElementCorrectly('workSpaceEditFormSaveBtn');
            const wowo_id = $A.dom.searchElementCorrectly('#workSpaceEditForm input[name="wowo_id"]', container);
            $A.app.wrapEventListeners(editTaskSaveBtn, 'data-workspace-id', wowo_id.value, 'click', async (e) => {
                e.preventDefault();
                const wowoId = e.currentTarget.getAttribute('data-workspace-id');
                if ($A.base.empty(wowoId)) {
                    //CreateWorkSpace('workSpaceEditForm');
                } else {
                    //UpdateWorkSpace('workSpaceEditForm');
                }
            });

            // handle modal close confirmation...
            $A.app.wrapEventListeners(container, 'null', null, 'hide.bs.modal', (e) => {
                if (!$A.forms.confirm('close WorkSpace Users Panel', 'Any unsaved data will be lost.')) {
                    e.preventDefault();
                    return null;
                }
            });
        }
    },

    departments: {
        fetch: function (mapper, containerId) {
            $A.query().search('wode').fields('wode_id', 'dede_name')
                .join({'left|department_id': 'dede_id'})
                .where({'workspace_id': mapper.wowoId})
                .order([{tbl:'dede', col: 'dede_name', sort: 'desc'}])
                .execute(containerId, component, mapper);
        },

        name: 'workspaceTeamMemberSettings.departments',
        mapper: ['wowoId'],
        tbls: ['wode', 'dede', 'wowo'],
        identifier: ['wowoId'],

        component: function(data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let originalLiItem = $A.dom.searchElementCorrectly('li.list-group-item', container);
            container.innerHTML = '';

            if ($A.base.not(data, 'list')) {
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

    embedDepartmentsData: {
        fetch: function(mapper, containerId) {
            return $A.query().search('dede').fields('dede_id', 'name')
                .order([{tbl:'dede', col: 'id', sort: 'desc'}])
                .execute(containerId, this, mapper);
        },
        name: 'workspaceTeamMemberSettings.embedDepartmentsData',
        mapper: [],
        tbls: ['dede'],
        identifier: [],

        /**
         * Embeds the data from query into form Select Fields.
         * For Department Ids
         * @param {obj} data 
         * @param {str} containerId 
         */
        component: function (data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let select = container.querySelector('form select[name="department_id"]');

            if ($A.base.not(select, 'domelement')) {
                throw Error('Error FB004: Cannot find Department Select Field.');
            }

            if ($A.base.not(data, 'list')) {
                throw Error('Error FB005: Cannot parse data object.');
            }

            data.forEach((itm) => {
                let elem = $A.dom.makeDomElement('option');
                elem.textContent = itm.name;
                elem.value = itm.dede_id;
                select.appendChild(elem);
            });
        }
    },
}

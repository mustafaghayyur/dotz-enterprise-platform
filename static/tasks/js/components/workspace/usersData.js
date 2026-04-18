import $A from "../../helper.js";

export default {
    default: {
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
        name: 'workspaceUsersData',
        mapper: ['currentDepts'],
        tbls: ['usus', 'deus'],
        identifier: ['currentDeptsJoined'], // @todo: how should arrays be used a sidentifiers?

        component: function(data, containerId) {
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
            const users = $A.state.call('workspaceUsersData.removeDuplicateUsers', { users: data });

            users.forEach((itm) => {
                let elem = $A.dom.makeDomElement('option');
                elem.textContent = `${itm.first_name} ${itm.last_name} (@${itm.username})`;
                elem.value = itm.usus_id;
                select.appendChild(elem);
            });
        }
    },

    removeDuplicateUsers: {
        fetch: function (mapper, containerId) {
            this.component({}, containerId, mapper);
        },
        name: 'workspaceUsersData.removeDuplicateUsers',
        mapper: ['users'],
        cache: false,

        /**
         * Removes duplicates from list
         * 
         * @param {arr} usersList 
         * @returns list
         */
        component: function(data, containerId, mapper) {
            let usersList = mapper.users;

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
    },

    addUsers: {
        fetch: function (mapper, containerId, componentName) {
            this.component({}, containerId, mapper);
        },
        name: 'workspaceUsersData.addUsers',
        mapper: ['workspace'],
        cache: false,

        component: function(data, containerId, mapper) {
            let workspace = mapper.workspace;
            let container = $A.dom.containerElement(containerId);
            let deptsField = $A.dom.searchElementCorrectly('form select[name="department_id"]', container);

            // allowed departments' list for workspace...
            fetchDepartmentsForWorkSpace('currentDepartmentsResponse', 'ws_embedDepartmentsData');

            $A.app.wrapEventListeners(deptsField, 'data-current-depts', null, 'change', (e) => {
                let depts = Array.from(e.currentTarget.selectedOptions);
                const currentDepts = depts.map(option => option.value);
                if ($A.generic.checkVariableType(currentDepts) === 'list' && currentDepts.length > 0) {
                    fetchUsersForDepartment('workSpaceEditModalResponse', 'ws_embedUsersDataIntoForm');
                }
            });

            // Save Operations Setup (Edit WorkSpace Modal)...
            const editTaskSaveBtn = $A.dom.obtainElementCorrectly('workSpaceEditFormSaveBtn');
            const wowo_id = $A.dom.searchElementCorrectly('#workSpaceEditForm input[name="wowo_id"]', container);
            $A.app.wrapEventListeners(editTaskSaveBtn, 'data-workspace-id', wowo_id.value, 'click', (e) => {
                e.preventDefault();
                const wowoId = e.currentTarget.getAttribute('data-workspace-id');
                if ($A.generic.isVariableEmpty(wowoId)) {
                    CreateWorkSpace('workSpaceEditForm');
                } else {
                    UpdateWorkSpace('workSpaceEditForm');
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
}

import $A from "../../helper.js";

const formName = 'workspaceUserSettingsForm';
const root = 'workspaceTeams'; // used by redux

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
            let form = $A.dom.searchElementCorrectly('#' + formName, container);
            let select = form.querySelector('select[name="department_id"]');
            let usersPane = $A.dom.searchElementCorrectly('#workspaceUserListsContainer', container);
            $A.redux.set(root, 'workspace', workspace);

            const miniFields = form.querySelectorAll('.mini-field-wrapper');
            if (miniFields.length > 1) {
                miniFields[1].classList.add('d-none'); // hide the team members select field
            }
            
            select.setAttribute('data-state-trigger', 'workspaceTeams.onDepartmentChange');
            select.setAttribute('data-state-trigger-event', 'change');


            // fetch initial departments list for workspace...
            await $A.state.call('workspaceTeams.embedDepartments', {mockery: 1});
            await $A.state.call('workspaceTeams.markCurrentDepartments', { wowoId: workspace.wowo_id });
            await $A.state.call('workspaceTeams.markCurrentUsers', { wowoId: workspace.wowo_id });
            return null;
        },

        /**
         * Use postRender to trigger change event on departments select field. 
         * This will ensure that users list is populated based on selected departments when we first load the pane.
         */
        postRender: async function(data, containerId, mapper) {
            let container = $A.dom.containerElement(containerId);
            let form = $A.dom.searchElementCorrectly('#' + formName, container);
            let select = form.querySelector('select[name="department_id"]');
            
            await $A.state.call('workspaceTeams.onDepartmentChange');
            return null;
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

            // prevent other selections from being de-selected upon change of departments
            select.querySelectorAll('option').forEach(option => {
                option.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    option.selected = !option.selected;
                    select.dispatchEvent(new Event('change'));
                    return false;
                });
            });
            return null;
        },
    },
    

    /**
     * Marks all current departments associated with WorkSpace, as selected in departments select field.
     */
    markCurrentDepartments: {
        fetch: function (mapper, containerId) {
            return $A.query().search('wode').fields('wode_id', 'department_id')
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

            let currentDepartments = [];
            select.querySelectorAll('option').forEach((option) => {
                const optionValue = Number(option.value);
                if (!Number.isNaN(optionValue) && departmentIds.includes(optionValue)) {
                    option.selected = true;
                    currentDepartments.push(optionValue); //{dede_id: optionValue, name: option.text}
                }
            });

            // save to state mapper
            $A.redux.set(root, 'currentDepartments', $A.base.stringify(currentDepartments, false));
            console.log('inspecting state 2', root, $A.redux.record(root), $A.redux.memory);
            return null;
        }
    },

    /**
     * Marks all current users associated with WorkSpace, as part of current users list.
     */
    markCurrentUsers: {
        fetch: function (mapper, containerId) {
            return $A.query().search('usus').fields('usus_id', 'first_name', 'last_name', 'username')
                .where({'wous_workspace_id': mapper.wowoId})
                .join({ 'left|usus_id': 'wous_user_id', })
                .order([{tbl:'usus', col: 'id', sort: 'desc'}])
                .execute(containerId, this, mapper);
        },
        name: 'workspaceTeams.markCurrentUsers',
        mapper: ['wowoId'],
        tbls: ['wous', 'usus', 'wowo'],
        identifier: ['wowoId'],
        component: function(data, containerId) {
            let container = $A.dom.containerElement(containerId);
            let addedUsersList = $A.dom.searchElementCorrectly('#addedUsersList', container);
            let liItemTemplate = $A.dom.searchElementCorrectly('.added-user-item', addedUsersList);
            let fragment = document.createDocumentFragment();
            
            console.log('marking current users...', data, container, addedUsersList, liItemTemplate);
            if ($A.base.not(data, 'list')) {
                throw Error('Data Error: Cannot find users for workspace.');
            }

            data.forEach((user) => {
                let clone = liItemTemplate.cloneNode(true);
                clone.classList.remove('d-none');
                clone.classList.add('added-user-item-' + user.user_id);
                let trigger = $A.dom.searchElementCorrectly('.remove-user-btn', clone);
                trigger.dataset.stateMapperUser = $A.base.stringify(user, false);
                $A.dom.searchElementCorrectly('.name-info', clone).textContent = `${user.first_name} ${user.last_name} (@${user.username})`;
                fragment.appendChild(clone);
            });
            addedUsersList.appendChild(fragment);
            return null;
        }
    },

    fetchUsers: {
        fetch: function (mapper, containerId) {
            return $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name')
                .join({ 'left|usus_id': 'deus_user_id', })
                .where({ deus_department_id: mapper.currentDepts,
                    user_level: '[between]10|50{and}' })
                .order([ {tbl:'usus', col: 'last_name', sort: 'asc'},
                    {tbl:'usus', col: 'first_name', sort: 'asc'} ])
                .page(1, 1000)//.translate({debug: true})
                .execute(containerId, this, mapper);
        },
        name: 'workspaceTeams.fetchUsers',
        mapper: ['currentDepts'],
        tbls: ['usus', 'deus'],
        identifier: ['currentDepts'],

        component: async function(data, containerId) {
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
            users.forEach((user) => {
                let elem = item.cloneNode(true);
                elem.classList.remove('d-none');
                elem.classList.add('user-item-' + user.usus_id);
                let trigger = $A.dom.searchElementCorrectly('.add-user-btn', elem);
                trigger.dataset.stateMapperUser = $A.base.stringify(user, false);
                $A.dom.searchElementCorrectly('.name-info', elem).textContent = `${user.first_name} ${user.last_name} (@${user.username})`;
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
            let container = $A.dom.containerElement(containerId);
            let deptsField = [...$A.dom.searchAllElementsCorrectly('form select[name="department_id"] option', container)];
            const selectedDepts = deptsField.filter(option => option.selected).map(option => Number(option.value));
            if ($A.base.is(selectedDepts, 'list') && selectedDepts.length > 0) {
                await $A.state.call('workspaceTeams.fetchUsers', { currentDepts: selectedDepts });
            }
            let savedDepts = $A.redux.get(root, 'currentDepartments', []);
            console.log('inspecting state', savedDepts, selectedDepts);
            // Ensure savedDepts is always an array to avoid primitive crashes
            if ($A.base.not(savedDepts, 'list')) {
                savedDepts = $A.base.empty(savedDepts) ? [] : [savedDepts];
            }
            
            // build these two lists based on the originals: selectedDepts and savedDepts.
            // We want to know which departments to add and which to remove based on the change.
            const selectedSet = new Set(selectedDepts);
            const savedSet = new Set(savedDepts);

            const deptsToAdd = selectedDepts.filter((deptId) => !savedSet.has(deptId));
            const deptsToRemove = savedDepts.filter((deptId) => !selectedSet.has(deptId));

            for (const dedeId of deptsToAdd) {
                await $A.state.call('workspaceTeams.addDepartment', { dede_id: dedeId, });
            }

            for (const dedeId of deptsToRemove) {
                await $A.state.call('workspaceTeams.removeDepartment', { dede_id: dedeId });
            }
            
            // run at the end...
            $A.redux.set(root, 'currentDepartments', $A.base.stringify(selectedDepts, false));
            return null;
        }
    },

    addUser: {
        name: 'workspaceTeams.addUser',
        mapper: ['user'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let container = $A.dom.containerElement(containerId);
            let workspace = $A.redux.get(root, 'workspace', {});
            let data = {
                workspace_id: workspace.wowo_id,
                user_id: mapper.user.usus_id,
            };
            $A.state.crud.create('wous',  data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                }, async (data, id) => {
                    await $A.state.call('workspaceTeams', {workspace});
                    
                    // finally do the normal crud procedures...
                    $A.app.generateResponseToAction(id, $A.base.get(mapper,'confirmMessage', `Team Member: ${mapper.user.first_name} ${mapper.user.last_name} added to WorkSpace.`));
                    $A.state.events.triggerAllForTable('wous');
                }
            );
        }
    },

    removeUser: {
        name: 'workspaceTeams.removeUser',
        mapper: ['user'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let container = $A.dom.containerElement(containerId);
            let workspace = $A.redux.get(root, 'workspace', {});
            let data = {
                workspace_id: workspace.wowo_id,
                user_id: mapper.user.usus_id,
            };
            $A.state.crud.delete('wous',  data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                identifierString: $A.base.get(mapper, 'identifierString', `remove ${mapper.user.first_name} ${mapper.user.last_name} from this team`),
                }, async (data, id) => {
                    await $A.state.call('workspaceTeams', {workspace});

                    // finally do the normal crud procedures...
                    $A.app.generateResponseToAction(id, $A.base.get(mapper,'confirmMessage', `Team Member: ${mapper.user.first_name} ${mapper.user.last_name} removed from WorkSpace.`));
                    $A.state.events.triggerAllForTable('wous');
                }
            );
        }
    },


    addDepartment: {
        name: 'workspaceTeams.addDepartment',
        mapper: ['dede_id'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let container = $A.dom.containerElement(containerId);
            let workspace = $A.redux.get(root, 'workspace', {});
            let data = {
                workspace_id: workspace.wowo_id,
                department_id: mapper.dede_id,
            };
            $A.state.crud.create('wode',  data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                confirmationMessage: $A.base.get(mapper,'confirmMessage', `Department with ID #${mapper.dede_id} added to WorkSpace.`),
            });
        }
    },

    removeDepartment: {
        name: 'workspaceTeams.removeDepartment',
        mapper: ['dede_id'],
        cache: false,
        component: function (trash, containerId, mapper) {
            let container = $A.dom.containerElement(containerId);
            let workspace = $A.redux.get(root, 'workspace', {});
            let data = {
                workspace_id: workspace.wowo_id,
                department_id: mapper.dede_id,
            };
            $A.state.crud.delete('wode',  data, {
                responseContainerId: $A.base.get(mapper, 'responseContainerId', containerId),
                identifierString: $A.base.get(mapper, 'identifierString', `disassociate department with ID #${mapper.dede_id} from this WorkSpace`),
                confirmationMessage: $A.base.get(mapper,'confirmMessage', `Department with ID #${mapper.dede_id} removed from WorkSpace.`),
            });
        }
    },
}

import $A from "../../helper.js";
import Sortable from 'sortablejs';

/**
 * For Team Leaders: 
 * Dashboard to mamange project cyles, tasks and priorities.
 * 
 * @param (*) data: API resultset retrieved by worspace API call in ws_workspaces.js.
 * @param (str) containerId: DOM element ID where response would be displayed.
 */
export default {
    default: {
        fetch: function (mapper, containerId) {
            $A.query().search('tata').fields('tata_id', 'description', 'status', 'assignee_id', 'assignor_id', 'creator_id', 'tata_create_time', 'tata_update_time', 'term_id')
                .where({
                    workspace_id: mapper.workspace.wowo_id,
                    tata_delete_time: 'is null'})
                .page(mapper.page || 1, 1000)
                .order([{tbl: 'tata', col: 'id', sort: 'desc'}])
                .execute(containerId, this, mapper);
        },

        name: 'workspaceManagementDashboard',
        mapper: ['workspace', 'tabKey', 'parent'],
        tbls: ['wowo', 'tata'],
        identifier: ['wowoId'],

        component: async function(tasks, containerId, mapper) {
            const parent = $A.dom.obtainElementCorrectly(mapper.parent);
            let container = $A.dom.containerElement(containerId, parent);
            let arenaBtn = $A.dom.searchElementCorrectly('#manageArena', parent);
            let mngmtaBtn = $A.dom.searchElementCorrectly('#manageWorkSpace', parent);
            
            if (arenaBtn && mngmtaBtn) {
                arenaBtn.classList.remove('d-none');
                mngmtaBtn.classList.add('d-none');
            }

            // Delegate rendering logic to child component so we can fetch terms beforehand.
            await $A.state.call('workspaceManagementDashboard.renderDashboard', {
                tasks: tasks,
                workspace: mapper.workspace,
                parent: mapper.parent,
                containerId: containerId
            });
        }
    },

    renderDashboard: {
        fetch: function (mapper, containerId) {
            $A.query().search('tatr').fields('tatr_id', 'name', 'parent_term_id')
                .where({
                    workspace_id: mapper.workspace.wowo_id,
                    tatr_delete_time: 'is null'})
                .page(1, 1000)
                .order([{tbl: 'tatr', col: 'id', sort: 'asc'}])
                .execute(containerId, this, mapper);
        },

        name: 'workspaceManagementDashboard.renderDashboard',
        mapper: ['tasks', 'workspace', 'parent', 'containerId'],
        tbls: ['tatr'],
        identifier: ['workspace'],

        component: function(terms, containerId, mapper) {
            const parent = $A.dom.obtainElementCorrectly(mapper.parent);
            const container = $A.dom.containerElement(mapper.containerId, parent);
            
            const termsGrid = $A.dom.searchElementCorrectly('.terms-grid', container);
            const backlogList = $A.dom.searchElementCorrectly('.backlog-list', container);
            
            const termTemplate = $A.dom.searchElementCorrectly('.term-template', container);
            const taskTemplate = $A.dom.searchElementCorrectly('.task-template', container);

            // Clear containers to prevent duplication across component re-renders
            termsGrid.innerHTML = '';
            backlogList.innerHTML = '';

            // Dictionary to map term lists for streamlined task distribution
            const termTaskContainers = {};

            // 1. Generate Term Bubbles
            if ($A.generic.checkVariableType(terms) === 'list') {
                terms.forEach((term) => {
                    let termNode = termTemplate.cloneNode(true);
                    termNode.classList.remove('term-template', 'd-none');
                    termNode.dataset.termId = term.tatr_id;
                    
                    $A.dom.searchElementCorrectly('.term-name', termNode).textContent = term.name || `Term #${term.tatr_id}`;
                    
                    // Configure Collapse Target Id and transition icons for each specific term
                    const collapseArea = $A.dom.searchElementCorrectly('.term-collapse-area', termNode);
                    const collapseBtn = $A.dom.searchElementCorrectly('.collapse-btn', termNode);
                    const collapseId = `term-collapse-${term.tatr_id}`;
                    collapseArea.id = collapseId;
                    collapseBtn.setAttribute('data-bs-target', `#${collapseId}`);

                    collapseArea.addEventListener('hide.bs.collapse', () => {
                        collapseBtn.innerHTML = '<i class="bi bi-plus"></i>';
                    });
                    collapseArea.addEventListener('show.bs.collapse', () => {
                        collapseBtn.innerHTML = '<i class="bi bi-dash"></i>';
                    });

                    // Configure Term Delete 
                    const deleteBtn = $A.dom.searchElementCorrectly('.delete-term-btn', termNode);
                    deleteBtn.addEventListener('click', () => {
                        if (confirm(`Are you sure you want to delete ${term.name || 'this term'}? Associated tasks will be moved to the backlog.`)) {
                            console.log(`Simulating deletion of term with ID: ${term.tatr_id}`);
                            // Implement your deletion via backend:
                            // $A.state.crud.delete('tatr', { tatr_id: term.tatr_id }, container);
                            
                            // Refresh to push tasks to the backlog cleanly:
                            $A.state.call('workspaceManagementDashboard', {
                                workspace: mapper.workspace,
                                parent: mapper.parent,
                                tabKey: mapper.workspace.wowo_id
                            });
                        }
                    });

                    termTaskContainers[term.tatr_id] = $A.dom.searchElementCorrectly('.task-list', termNode);
                    termsGrid.appendChild(termNode);
                });
            }

            // 2. Route Tasks into Matching Terms or Backlog
            if ($A.generic.checkVariableType(mapper.tasks) === 'list') {
                mapper.tasks.forEach((task) => {
                    let taskNode = taskTemplate.cloneNode(true);
                    taskNode.classList.remove('task-template', 'd-none');
                    taskNode.dataset.taskId = task.tata_id;
                    
                    $A.dom.searchElementCorrectly('.task-desc', taskNode).textContent = task.description || 'No Description';
                    $A.dom.searchElementCorrectly('.task-deadline', taskNode).textContent = task.deadline || 'N/A';
                    $A.dom.searchElementCorrectly('.task-creator', taskNode).textContent = task.creator_id || 'N/A';
                    $A.dom.searchElementCorrectly('.task-status', taskNode).textContent = task.status || 'N/A';

                    if (task.term_id && termTaskContainers[task.term_id]) {
                        termTaskContainers[task.term_id].appendChild(taskNode);
                    } else {
                        backlogList.appendChild(taskNode);
                    }
                });
            }

            // 3. Setup SortableJS for Drag-and-Drop functionality
            
            // Make Term bubbles horizontally sortable
            new Sortable(termsGrid, {
                animation: 150,
                handle: '.term-handle',
                ghostClass: 'bg-light'
            });

            // Make Tasks vertically sortable across distinct terms and backlog
            const allTaskLists = $A.dom.searchAllElementsCorrectly('.sortable-task-list', container);
            if (allTaskLists) {
                allTaskLists.forEach((list) => {
                    new Sortable(list, {
                        group: 'kanbanBoard', // Standardizing group to allow fluid movement between lists
                        animation: 150,
                        ghostClass: 'bg-light',
                        onEnd: function (evt) {
                            const taskId = evt.item.dataset.taskId;
                            const toList = evt.to;
                            
                            let newTermId = null;
                            const termBubble = toList.closest('.term-bubble');
                            if (termBubble) {
                                newTermId = termBubble.dataset.termId;
                            }

                            console.log(`Task ${taskId} moved to term ${newTermId || 'backlog'}`);
                            // Implement your drop update API call here:
                            // $A.state.crud.update('tata', { tata_id: taskId, term_id: newTermId }, container);
                        }
                    });
                });
            }
        }
    }
}

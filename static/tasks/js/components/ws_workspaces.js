//import _ from 'lodash';
import $A from "../helper.js";

/**
 * Implements the entire Tasks' WorkSPaces Dashboard.
 * All workspaces are displaced as sub-tabs.
 * Each work-space-tab carries a dashboard for that workspace, where all tasks are organized based on progress.
 * 
 * @param (*) data: API resultset rent by worspace API call in main.js.
 * @param (str) containerId: DOm element ID were response would be displayed.
 */
export default (data, containerId) => {
    let container = $A.app.containerElement(containerId);

    const TasksO2OKeys = $A.app.memFetch('o2oTaskFields', true);
    let tabs = $A.app.searchElementCorrectly('.nav-tabs', container);
    let panes = $A.app.searchElementCorrectly('.tab-content', container);
    let tabTemplate = $A.app.searchElementCorrectly('.nav-tabs .nav-item', container);
    let paneTemplate = $A.app.searchElementCorrectly('.tab-content .tab-pane', container);
    let caller = {};

    //reset the tabs and panes so new tabs/panes can be added.
    tabs.innerHTML = '';
    panes.innerHTML = '';
    let isDefault = false;
    let i = 0;

    data.forEach((itm) => {
        const tabKey = `WOWOitm-${itm.wowo_id}`;

        if (i === 0) {
            isDefault = true;
        }

        tabs.appendChild($A.app.makeNewTab(tabTemplate, tabKey, itm.name, isDefault));
        panes.appendChild($A.app.makeNewPane(paneTemplate, tabKey, isDefault));
        i++;

        let btn = $A.app.searchElementCorrectly(`#pane-${tabKey} #newWorkSpaceTask`, panes);
        btn.setAttribute('data-wowo-id', itm.wowo_id);

        btn.addEventListener('click', async ()=>{        
            $A.tasks.forms.cleanTaskForm('taskEditForm', TasksO2OKeys);
            const taskEditForm = await $A.tasks.load('taskEditForm');
            taskEditForm(itm.wowo_id);
        });

        // finally, we define callbacks for each tab
        caller[tabKey] = async () => {
            $A.query().search('tata')
                .fields('tata_id', 'description', 'status', 'creator_id', 'assignee_id', 'deadline', 'tata_create_time')
                .where({
                    workspace_id: itm.wowo_id,
                    tata_delete_time: 'is null',
                }).order([
                    {tbl: 'tata', col: 'id', sort: 'desc'},
                ]).page(1, 1000)
                .execute('workspacesDashboardResponse', createWorkSpaceDashboard, {key: tabKey, data: itm});
        }
    });

    $A.dashboard('wsTabs', caller);


    /**
     * Morphes Tasks data retrieved from the backend for specified WorkSpace, 
     * and displays a Tasks dashboard for given workspace.
     * 
     * @param {*} data: retrived from API call.
     * @param {str} responseContainerId: DOM element id value for error messages display container.
     */
    async function createWorkSpaceDashboard(tasks, responseContainerId, mapper) {
        const wsKey = mapper.key;
        const workspace = mapper.data;
        const container = $A.app.searchElementCorrectly(`#pane-${wsKey}`, document);
        const template = $A.app.searchElementCorrectly('.card', container);
        const taskViewCallback = await $A.tasks.load('taskDetailsView');

        if ($A.generic.checkVariableType(tasks) !== 'list') {
            throw Error('UI Error: Inside createWorkSpaceDashboard() - provided tasks data not in correct format.');
        }

        const buckets = sortTasksBasedOnProgress(tasks);

        if ($A.generic.checkVariableType(buckets) !== 'dictionary') {
            throw Error('UI Error: tasks could not be sorted into buckets.');
        }

        $A.generic.loopObject(buckets, (key, list) => {
            if ($A.generic.checkVariableType(list) !== 'list') {
                throw Error('UI Error: tasks could not be sorted into lists for bucket: ' + key);
            }

            let bucketContainer = $A.app.searchElementCorrectly(`.${key}-col`, container);
            
            list.forEach((task) => {
                let clone = template.cloneNode(true);
                clone.classList.remove('d-none');
                $A.app.embedData(task, clone, true);
                let link = $A.app.searchElementCorrectly('.embed.description', clone);

                link.addEventListener('click', async ()=>{
                    $A.query().read('tata', {
                        tata_id: task.tata_id
                    }).execute('taskDetailsModalResponse', taskViewCallback);
                });

                $A.router.update('task_id', task.tata_id);
                bucketContainer.appendChild(clone);
            });
        });
    }

    /**
     * Sorts the array of Task dictionaries into four meaningful piles:
     *  1) Backlog | 2) Started | 3) Under Review 4) Completed
     * 
     * @param {array} tasks: all retrieved tasks from API for given workspace.
     */
    function sortTasksBasedOnProgress(tasks) {
        console.log('Inside sortTasksBasedOnProgress() checking unsorted tasks: ', tasks);
        const buckets = {
            backlog: [],
            started: [],
            'under-review': [],
            completed: []
        };

        const statusMap = {
            created: 'backlog',
            assigned: 'backlog',
            onhold: 'backlog',
            started: 'started',
            awaitingfeedback: 'under-review',
            completed: 'completed',
            abandoned: 'completed',
            failed: 'completed'
        };

        tasks.forEach(task => {
            const bucket = statusMap[task.status];
            if (bucket) {
                buckets[bucket].push(task);
            }
        });

        console.log('sortTasksBasedOnProgress(): Buckets filled with tasks: ', buckets);

        const sortOrders = {
            backlog: ['created', 'assigned', 'onhold'],
            started: ['started'],
            'under-review': ['awaitingfeedback'],
            completed: ['completed', 'abandoned', 'failed']
        };

        Object.keys(buckets).forEach(key => {
            buckets[key].sort((a, b) => {
                const order = sortOrders[key];
                const aIndex = order.indexOf(a.status);
                const bIndex = order.indexOf(b.status);
                if (aIndex !== bIndex) return aIndex - bIndex;
                return a.tata_id - b.tata_id;
            });
        });

        console.log('sortTasksBasedOnProgress(): Buckets sorted by actual status + ids: ', buckets);

        return buckets;
    }
}

//import _ from 'lodash';
import $A from "../../helper.js";
import { DeleteWorkSpace } from '../../crud/workspaces.js';

/**
 * Morphes Tasks data retrieved from the backend for specified WorkSpace, 
 * and displays a Tasks dashboard for given workspace.
 * 
 * @param {*} data: retrived from API call.
 * @param {str} responseContainerId: DOM element id value for error messages display container.
 */
export default {
    fetch: {
        default: function (mapper, containerId, componentName) {
            $A.query().search('tata')
                .fields('tata_id', 'description', 'status', 'creator_id', 'assignee_id', 'deadline', 'tata_create_time')
                .where({
                    workspace_id: mapper.workSpaceInfo.wowo_id,
                    tata_delete_time: 'is null',
                }).order([
                    {tbl: 'tata', col: 'id', sort: 'desc'},
                ]).page(1, 1000)
                .execute(containerId, component, {key: mapper.tabKey, data: mapper.workSpaceInfo});
        }
    },

    component: {
        default: async function(tasks, responseContainerId, mapper) {
            const wsKey = mapper.key;
            const workspace = mapper.data;
            const container = $A.dom.searchElementCorrectly(`#pane-${wsKey} #WSDB`, document);
            const template = $A.dom.searchElementCorrectly('.card', container);
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

                let bucketContainer = $A.dom.searchElementCorrectly(`.${key}-col`, container);
                
                list.forEach((task) => {
                    let clone = template.cloneNode(true);
                    clone.classList.remove('d-none');
                    $A.ui.embedData(task, clone, true);
                    let link = $A.dom.searchElementCorrectly('.embed.description', clone);

                    $A.state.dom.addMapperArguments(link, 'task-id', task.tata_id);
                    link.addEventListener('click', async ()=>{
                        $A.query().read('tata', {
                            tata_id: task.tata_id
                        }).execute('taskDetailsModalResponse', taskViewCallback);
                    });

                    $A.router.update('task_id', task.tata_id);
                    bucketContainer.appendChild(clone);
                });
            });

            
            /**
             * Sorts the array of Task dictionaries into four meaningful piles:
             *  1) Backlog | 2) Started | 3) Under Review 4) Completed
             * 
             * @param {array} tasks: all retrieved tasks from API for given workspace.
             */
            function sortTasksBasedOnProgress(tasks) {
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

                return buckets;
            }
        }
    }
}

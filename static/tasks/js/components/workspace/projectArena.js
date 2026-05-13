import $A from "../../helper.js";

/**
 * Morphes Tasks data retrieved from the backend for specified WorkSpace, 
 * and displays a Tasks dashboard for given workspace.
 * 
 * @param {*} data: retrived from API call.
 * @param {str} responseContainerId: DOM element id value for error messages display container.
 */
export default {
    default: {
        fetch: function (mapper, containerId) {
            return $A.query().search('tata')
                .fields('tata_id', 'description', 'status', 'creator_id', 'assignee_id', 'deadline', 'tata_create_time')
                .where({ workspace_id: mapper.workspace.wowo_id,
                    visibility: 'workspaces',
                    tata_delete_time: 'is null', })
                .order([{tbl: 'tata', col: 'id', sort: 'desc'},]).page(1, 1000)
                .execute(containerId, this, mapper);
        },

        name: 'workspaceProjectArena',
        mapper: ['workspace', 'containerParts', 'parent'],
        identifier: ['containerParts'],
        tbls: ['tata', 'wowo'],

        component: async function(tasks, containerId, mapper) {
            const container = $A.dom.containerElement(containerId);
            const template = $A.dom.searchElementCorrectly('.card', container);

            const parent = $A.dom.obtainElementCorrectly(mapper.parent);
            let arenaBtn = $A.dom.searchElementCorrectly('#manageArena', parent);
            let mngmtaBtn = $A.dom.searchElementCorrectly('#manageWorkSpace', parent);
            arenaBtn.classList.add('d-none');
            mngmtaBtn.classList.remove('d-none');
            
            if ($A.base.not(tasks, 'list')) {
                throw Error('UI Error: Inside createWorkSpaceDashboard() - provided tasks data not in correct format.');
            }

            const buckets = sortTasksBasedOnProgress(tasks);
            let bucketFragments = {};

            if ($A.base.not(buckets, 'dictionary')) {
                throw Error('UI Error: tasks could not be sorted into buckets.');
            }

            $A.base.loop(buckets, (key, list) => {
                if ($A.base.not(list, 'list')) {
                    throw Error('UI Error: tasks could not be sorted into lists for bucket: ' + key);
                }

                bucketFragments[key] = document.createDocumentFragment();

                list.forEach((task) => {
                    let clone = template.cloneNode(true);
                    clone.classList.remove('d-none');
                    $A.output.embedText(task.description, [0, 160], '.embed.description', clone);
                    let meta = $A.dom.searchElementCorrectly('.embed.task-meta', clone);
                    
                    // Set popover content for task-meta (status, assignee, creator, deadline)
                    const creator = $A.app.user(task.creator_id, containerId);
                    const assignee = $A.app.user(task.assignee_id, containerId);                    
                    let assigneeName = `${$A.base.get(assignee, 'first_name', '')} ${$A.base.get(assignee, 'last_name', '')}`;
                    let creatorName = `${$A.base.get(creator, 'first_name', '')} ${$A.base.get(creator, 'last_name', '')}`;
                    let metaString = `Status: ${task.status} | Assignee: ${assigneeName} | Creator: ${creatorName} | Deadline: ${task.deadline}`;
                    meta.dataset.bsTitle = task.description;
                    meta.dataset.bsContent = metaString;
                    
                    let link = $A.dom.searchElementCorrectly('.embed.description', clone);
                    $A.state.dom.addMapperArguments(link, 'task-id', task.tata_id);
                    bucketFragments[key].appendChild(clone);
                    $A.router.update('task_id', task.tata_id);
                });

                const bucketContainer = $A.dom.searchElementCorrectly(`.${key}-col`, container);
                
                // Clear previously added items to prevent duplicates upon state trigger
                // @todo: this cleanup should have happenned with component clean, find out why we need it...
                //bucketContainer.querySelectorAll('.card:not(.d-none)').forEach(el => el.remove());
                bucketContainer.appendChild(bucketFragments[key]);
            });


            /**
             * Sorts the array of Task dictionaries into four meaningful piles:
             *  1) Backlog | 2) Started | 3) Under Review 4) Completed
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
    },
}

tasks = {
    'tata': {
        'table': 'tasks_task',
        'model': 'Task',
        'path': 'tasks.models',
        'type': 'o2o',
        'cols': [
            'id',
			'description',
			'create_time',
			'update_time',
			'delete_time',
			'creator_id',
			'parent_id'
        ],
    },
    'tade': {
        'table': 'tasks_details',
        'model': 'Details',
        'path': 'tasks.models',
        'type': 'o2o',
        'cols': [
            'id',
			'details',
			'latest',
			'create_time',
			'delete_time',
			'task_id'
        ],
    },
    'tadl': {
        'table': 'tasks_deadline',
        'model': 'Deadline',
        'path': 'tasks.models',
        'type': 'o2o',
        'cols': [
            'id',
			'deadline',
			'latest',
			'create_time',
			'delete_time',
			'task_id'
        ],
    },
    'tast': {
        'table': 'tasks_status',
        'model': 'Status',
        'path': 'tasks.models',
        'type': 'o2o',
        'cols': [
            'id',
			'status',
			'latest',
			'create_time',
			'delete_time',
			'task_id'
        ],
    },
    'tavi': {
        'table': 'tasks_visibility',
        'model': 'Visibility',
        'path': 'tasks.models',
        'type': 'o2o',
        'cols': [
            'id',
			'visibility',
			'latest',
			'create_time',
			'delete_time',
			'task_id'
        ],
    },
    'taas': {
        'table': 'tasks_assignment',
        'model': 'Assignment',
        'path': 'tasks.models',
        'type': 'o2o',
        'cols': [
            'id',
			'latest',
			'create_time',
			'delete_time',
			'assignee_id',
			'assignor_id',
			'task_id'
        ],
    },
    'tawa': {
        'table': 'tasks_watcher',
        'model': 'Watcher',
        'path': 'tasks.models',
        'type': 'm2m',
        'cols': [
            'id',
			'latest',
			'create_time',
			'delete_time',
			'task_id',
			'watcher_id'
        ],
    },
    'taco': {
        'table': 'tasks_comment',
        'model': 'Comment',
        'path': 'tasks.models',
        'type': 'rlc',
        'cols': [
            'id',
			'comment',
			'parent_id',
			'create_time',
			'update_time',
			'delete_time',
            'commenter_id',
			'task_id'
        ],
    },
    'tawo': {
        'table': 'tasks_workspacetasks',
        'model': 'WorkSpaceTasks',
        'path': 'tasks.models',
        'type': 'o2o',
        'cols': [
            'id',
			'create_time',
			'delete_time',
			'task_id',
			'workspace_id',
            'latest'
        ],
    },
}
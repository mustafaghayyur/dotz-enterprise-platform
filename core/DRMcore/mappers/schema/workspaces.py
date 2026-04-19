workspaces = {
    'wowo': {
        'table': 'tasks_workspace',
        'model': 'WorkSpace',
        'path': 'tasks.models',
        'type': 'o2o',
        'cols': [
            'id',
			'name',
			'description',
			'type',
            'creator_id',
			'create_time',
			'update_time',
			'delete_time'
        ],
    },
    'wolc': {
        'table': 'tasks_projectlifecycle',
        'model': 'ProjectLifeCycle',
        'path': 'tasks.models',
        'type': 'o2o',
        'cols': [
            'id',
			'start',
			'end',
			'interval_length',
			'interval_type',
            'life_cycle_type',
            'creator_id',
			'create_time',
			'delete_time'
        ],
    },
    'wode': {
        'table': 'tasks_workspacedepartment',
        'model': 'WorkSpaceDepartment',
        'path': 'tasks.models',
        'type': 'm2m',
        'cols': [
            'id',
			'create_time',
			'delete_time',
			'department_id',
			'workspace_id',
            'latest'
        ],
    },
    'wous': {
        'table': 'tasks_workspaceuser',
        'model': 'WorkSpaceUser',
        'path': 'tasks.models',
        'type': 'm2m',
        'cols': [
            'id',
			'create_time',
			'delete_time',
			'user_id',
			'workspace_id',
            'latest'
        ],
    },
    'wote': {
        'table': 'tasks_workspaceterm',
        'model': 'WorkSpaceTerm',
        'path': 'tasks.models',
        'type': 'rlc',
        'cols': [
            'id',
			'create_time',
			'update_time',
			'delete_time',
			'term',
            'description',
			'workspace_id',
			'parent_id',
        ],
    },
}
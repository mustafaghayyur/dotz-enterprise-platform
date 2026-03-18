users = {
    'usus': {
        'table': 'auth_user',
        'model': 'User',
        'path': 'users.models',
        'type': 'o2o',
        'cols': [
            'id',
			'password',
			'last_login',
			'is_superuser',
			'username',
			'first_name',
			'last_name',
			'email',
			'is_staff',
			'is_active',
			'date_joined',
			'create_time',
			'delete_time',
			'update_time',
			'user_level'
        ],
    },
    'uspr': {
        'table': 'users_userprofile',
        'model': 'UserProfile',
        'path': 'users.models',
        'type': 'o2o',
        'cols': [
            'id',
			'legal_first_name',
			'legal_last_name',
			'office_phone',
			'office_ext',
			'cell_phone',
			'home_phone',
			'office_location',
			'create_time',
			'delete_time',
			'user_id',
			'latest'
        ],
    },
    'usse': {
        'table': 'users_usersettings',
        'model': 'UserSettings',
        'path': 'users.models',
        'type': 'o2o',
        'cols': [
            'id',
			'settings',
			'create_time',
			'update_time',
			'delete_time',
			'user_id',
			'latest'
        ],
    },
    'usre': {
        'table': 'users_userreportsto',
        'model': 'UserReportsTo',
        'path': 'users.models',
        'type': 'm2m',
        'cols': [
            'id',
			'create_time',
			'delete_time',
			'reportsTo_id',
			'user_id',
			'latest'
        ],
    },
    'uslo': {
        'table': 'users_editlog',
        'model': 'EditLog',
        'path': 'users.models',
        'type': 'rlc',
        'cols': [
            'id',
			'change_log',
			'create_time',
			'update_time',
			'delete_time',
            'user_id'
        ],
    },
}
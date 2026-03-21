"""
    These settings can be imported to anywhere in the project with:
     > from core.dotzSettings import * (asterisk representing name of dictionary)
"""
from core.lib.state import State

settings = State()

settings.set('project', {
    'mapper': {
        'tblKeySize': 5, # 4 + _ = 5 characters for table-key-size
        'dataRelationshipTypes': ['o2o', 'm2m', 'rlc'],
    },

    # Number of days a task stays in the database system post completion or fail
    'tasksLifeSpan': '1095',
    # Number of days a ticket stays in the database system post completion or fail
    'ticketsLifeSpan': '1095',

    # Number of days the following records stay 'deleted' post being marked deleted:
    'tasksGarbageBin': '90',
    'ticketsGarbageBin': '90',
    'documentsGarbageBin': '30',
    'customersGarbageBin': '90',

    'logCrudOnProd': False,
    'crud_logger_file': '/Users/mustafa/Sites/logs/crmpmsoft/core/CRUD.log',  # CRUD operations are logged properly when Django's DEBUG setting is True:
    'debug_log_file': '/Users/mustafa/Sites/logs/crmpmsoft/DEBUG.log'  # CRUD operations are logged properly when Django's DEBUG setting is True:
})

settings.set('tasks', {
    'recentInterval': '30',  # what is recent in generic query terms? Number of days.
    'crud_logger_file': '/Users/mustafa/Sites/logs/crmpmsoft/tasks/CRUD.log'  # CRUD operations are logged properly when Django's DEBUG setting is True:
})

settings.set('users', {
    'recentInterval': '30',  # what is recent in generic query terms? Number of days.
    'crud_logger_file': '/Users/mustafa/Sites/logs/crmpmsoft/users/CRUD.log'  # CRUD operations are logged properly when Django's DEBUG setting is True:
})

settings.set('tickets', {
    'recentInterval': '30',  # what is recent in generic query terms? Number of days.
    'crud_logger_file': '/Users/mustafa/Sites/logs/crmpmsoft/tickets/CRUD.log'  # CRUD operations are logged properly when Django's DEBUG setting is True:
})

settings.set('documents', {
    'recentInterval': '30',  # what is recent in generic query terms? Number of days.
    'crud_logger_file': '/Users/mustafa/Sites/logs/crmpmsoft/docs/CRUD.log'  # CRUD operations are logged properly when Django's DEBUG setting is True:
})

settings.set('customers', {
    'recentInterval': '30',  # what is recent in generic query terms? Number of days.
    'crud_logger_file': '/Users/mustafa/Sites/logs/crmpmsoft/customers/CRUD.log'  # CRUD operations are logged properly when Django's DEBUG setting is True:
})



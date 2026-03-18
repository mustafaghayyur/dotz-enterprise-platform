/**
 * constants.js will always carry important lists/variables our software needs.
 */

export default {
    // Keys we expect in the TasksO2O resultSet (keeps defined order)
    values: {
        visibility: {
            private: 'private', 
            workspaces: 'workspaces'
        },
        status: {
            created: 'created', 
            assigned: 'assigned',
            started: 'started', 
            awaitingfeedback: 'awaitingfeedback',
            completed: 'completed', 
            abandoned: 'abandoned',
            onhold: 'onhold', 
            failed: 'failed',
        },
        wsType: {
            private: 'private', 
            open: 'open'
        },
    }
};


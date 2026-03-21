import $A from "../helper.js";

export default {
    /**
     * Loads a component specified with arguments.
     * No use of this.* in arrow functions.
     * @param {str} component: name of specific component. Components in sub-folders should be denoted with a 'subfolder.compoenentName' notation.
     * @param {str} app: name of django app/module we are operating in 
     */
    load: async function (component, app) {
        const componentPath = component.replace(/\./, '/');
        try {
            // The import() function accepts the string variable
            const module = await import(`../../../${app}/js/components/${componentPath}.js`);
            return module.default;
        } catch (error) {
            console.error('Error loading component:', error);
        }
    },

    /**
     * Save key=>value  pair to localStorage
     * No use of this.* in arrow functions.
     * @param {*} key 
     * @param {*} value 
     */
    memSave: function (key, value) {
        if ($A.generic.checkVariableType(key) !== 'string') {
            throw Error('UI Error: cannot save non-string keys to localstorage.');
        }

        if ($A.generic.isPrimitiveValue(value)) {
            localStorage.setItem(key, value);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    },

    /**
     * Fetch localStorage value with key.
     * No use of this.* in arrow functions.
     * @param {*} key 
     * @param {*} isJson 
     * @returns 
     */
    memFetch: function (key, isJson = false) {
        let strValue = localStorage.getItem(key);
        return isJson ? JSON.parse(strValue) : strValue;
    },

    /**
     * Fetches the user object for specified ID and saves to localstorage.
     * If user id exists in localstorage, retrieves that value.
     * @param {number} user_id 
     * @param {array} fields 
     */
    user: function (user_id, containerId, returnNull = false, iter = 0) {
        if (iter > 1) {
            if (returnNull) {
                return null;
            }
            throw Error('UI Error: could not find user with id: ' + user_id + ' in system. Maximum attempts reached.');
        }

        user_id = Number(user_id);

        const users = $A.app.memFetch('users', true);

        let user = $A.generic.getter(users, user_id);

        if (!user) {
            $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name', 'email', 'user_level')
                .where({usus_id: user_id, usus_delete_time: null}).execute(containerId, (data, containerId, mapper) => {
                    let users = mapper.users;

                    if ($A.generic.checkVariableType(data) === 'list') {
                        data = data[0];
                    }

                    if ($A.generic.isVariableEmpty(data)) {
                        if (returnNull) {
                            return null;
                        }

                        throw Error('UI Error: could not find user with id: ' + user_id + '. Fetch attempt failed.');
                    }

                    if ($A.generic.checkVariableType(data) === 'dictionary') {
                        if ($A.generic.getter(data, 'usus_id') && data.usus_id === user_id) {
                            if ($A.generic.isVariableEmpty(users)) {
                                users = {};
                            }
                            users[user_id] = data;
                            $A.app.memSave('users', users);
                        }
                    }
                }, { users: users });

            user = $A.app.user(user_id, containerId, returnNull, iter = (iter + 1));
        }

        if (!user) {
            if (returnNull) {
                return null;
            }
            throw Error('UI Error: could not find user with id: ' + user_id + ' in system. Something went wrong.');
        }

        return user;
    },


    /**
     * Sets everything up to allow for Modals to safely execute events.
     * Without modal dom duplication causing problems.
     * 
     * @param {dom} container: instance of DOM node element
     * @param {str} dataKey: data-key to pass along. Use e.currentTarget.getAttribute() to get acces to this key
     * @param {*} dataValue: value for data-key
     * @param {str} eventType: event-listener string identifyer (click, change, etc)
     * @param {func} callback: actions to perform on event trigger.
     */
    wrapEventListeners: function(container, dataKey, dataValue, eventType, callback) {
        container.setAttribute(dataKey, dataValue);
        if (!container.hasDeleteListener) {
            container.addEventListener(eventType, callback);
        }
        container.hasDeleteListener = true;
    },

    /**
     * Set up some cllback function to operate at specific screen sizes.
     * 
     * @param {*} size: Choose $A.data.screens.{value}: xs, sm, md, lg, xl, xxl
     * @param {*} container 
     * @param {*} callbackFunction 
     */
    handleScreenSizeAdjustments: function (size, callbackFunction) {
        const screenQuery = window.matchMedia(`(max-width: ${size}px)`);
        
        screenQuery.addEventListener('change', (screenQuery) => {
            if (screenQuery.matches) {
                callbackFunction();
            }
        });
    }
};


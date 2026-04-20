import $A from "../helper.js";

export default {
    /**
     * Add init operations to be implemented software-wide, 
     * here. Unauthenticated interfaces run this block as well.
     */
    runBasicSetupOperations: function (container) {
        if ($A.base.not(container, 'domelement')) {
            container = document;
        }
        // initialize tooltips for entire software:
        $A.app.initializeTooltips(container);
        $A.app.initializePopovers(container);
        fixForms(container);

        $A.state.events.activateTriggers(container);
        $A.state.events.listenForBSEvents();

        /**
         * Fix operations on forms - globally.
         */
        function fixForms(container) {
            // configure django forms upon init:
            const forms = $A.dom.searchAllElementsCorrectly('form', container);
            if (forms) {
                forms.forEach((form) => {
                    // radio-btn classes need to be fixed:
                    let radios = $A.dom.searchAllElementsCorrectly('div.form-check.form-check-inline input[type="radio"]', form);
                    if (radios) {
                        radios.forEach((radio) => {
                            radio.classList.remove('form-check');
                            radio.classList.remove('form-check-inline');
                            radio.classList.add('form-check-input');
                        });
                    }

                    //$A.app.snapshotInceptionState(form.id);
                });
            }
        }
    },

    /**
     * Captures a snapshot of the component HTML DOMs right after it was created.
     * This allows cleanComponentDom() to revert any structural changes (classes, inserted divs) made by JS later.
     */
    snapshotInceptionState: function (containerId) {
        const container = $A.base.is(containerId, 'domelement') ? containerId : $A.dom.obtainElementCorrectly(containerId, false);
        if (container && !container._inceptionDomState) {
            container._inceptionDomState = container.innerHTML;
            console.log('[clean] - [raw] snapshotted container: ' + container.id);
        }
    },
    
    /**
     * Redirect users to login screen...
     */
    relocateToLogin: function () {
        let urls = this.memFetch('allowed_routes', true);
        window.location.href = urls.ui.auth.login;
    },

    /**
     * Loads a custom library with dynamic loading.
     * All libs should be in custom subdir of {app}/js/lib/{custom-lib-subdir}/
     * @param {str} component: name of specific component. Components in sub-folders should be denoted with a 'subfolder.componentName' notation.
     * @param {str} app: name of django app/module we are operating in 
     */
    load: async function (component, app) {
        // Support nested component paths via dot notation: 'sub-dir.component-file' -> 'sub-dir/component-file'
        const parts = component.split('.');
        const subdir = parts[0];
        const componentName = parts[1];
        try {
            const module = await import(`../../../${app}/js/lib/${subdir}/${componentName}.js`);
            return module.default;
        } catch (error) {
            console.error('App Error: Failed to load component:', error);
            throw new Error(`App Error: ${component} module not found for: ${app}`);
        }
    },


    /**
     * Save key=>value  pair to localStorage
     * No use of this.* in arrow functions.
     * @param {*} key 
     * @param {*} value 
     */
    memSave: function (key, value) {
        if ($A.base.not(key, 'string')) {
            throw Error('UI Error: cannot save non-string keys to localstorage.');
        }

        if ($A.base.isPrimitive(value)) {
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
            console.warn('UI Error: could not find user with id: ' + user_id + ' in system. Maximum attempts reached.', containerId);
            return null;
        }

        user_id = Number(user_id);
        const users = this.memFetch('users', true);
        let user = $A.base.get(users, user_id);

        if (!user) {
            $A.query().search('usus').fields('usus_id', 'username', 'first_name', 'last_name', 'email', 'user_level')
                .where({usus_id: user_id, usus_delete_time: null}).execute(containerId, (data, containerId, mapper) => {
                    let users = mapper.users;

                    if ($A.base.is(data, 'list')) {
                        data = data[0];
                    }

                    if ($A.base.empty(data)) {
                        if (returnNull) {
                            return null;
                        }

                        console.warn('UI Error: could not find user with id: ' + user_id + '. Fetch attempt failed.', data);
                    }

                    if ($A.base.is(data, 'dictionary')) {
                        if ($A.base.get(data, 'usus_id') && data.usus_id === user_id) {
                            if ($A.base.empty(users)) {
                                users = {};
                            }
                            users[user_id] = data;
                            $A.app.memSave('users', users);
                        }
                    }
                }, { users: users });

            user = this.user(user_id, containerId, returnNull, iter = (iter + 1));
        }

        if (!user) {
            if (returnNull) {
                return null;
            }
            console.warn('UI Error: could not find user with id: ' + user_id + ' in system. Something went wrong.');
        }

        return user;
    },


    /**
     * Sets everything up to allow for Modals to safely execute events.
     * Without modal dom duplication causing problems.
     * Use e.currentTarget.dataset... to retrieve binded data
     * 
     * @param {str} eventType: event-listener string identifier (click, change, etc)
     * @param {dom} elem: instance of DOM node element to add listener on
     * @param {func} callback: callback actions to perform on event trigger.
     * @param {obj} dictionary: key/val pairs in stringify format to pass to listener
     */
    eventListener: function(eventType, elem, callback, dictionary) {
        elem.setAttribute('data-listener-data', dictionary);
        if (!elem.hasGenericListener) {
            elem.addEventListener(eventType, callback);
        }
        elem.hasGenericListener = true;
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
    },

    /**
     * Generates BootStrap alert box.
     *  
     * @param {str} containerId: dom eleven id without the #
     * @param {*} response
     * @param {str} code: alert level as found in BS
     */
    generateResponseToAction: function (containerId, response, code = 'success') {
        let container = $A.dom.obtainElementCorrectly(containerId);
        container.classList.add('alert');
        container.classList.add('alert-' + code);
        container.classList.add('px-3');
        container.classList.add('py-2');
        container.classList.add('my-3');
        if ($A.base.is(response, 'domelement')) {
            container.appendChild(response);
        } else {
            container.appendChild(document.createTextNode($A.base.stringify(response)));
        }
    },

    /**
     * Initialize tooltips for elements with data-bs-toggle="tooltip".
     * Can be called on specific containers or the entire document.
     * @param {HTMLElement} container - Optional container element to search within. Defaults to document.
     */
    initializeTooltips: function (container = document, checkForInitialized = true) {
        const tooltipTriggerList = container.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
            // Check if tooltip is already initialized
            if (!checkForInitialized || tooltipTriggerEl.getAttribute('data-bs-tooltip-initialized') !== 'true') {
                tooltipTriggerEl.setAttribute('data-bs-tooltip-initialized', 'true');
                return new bootstrap.Tooltip(tooltipTriggerEl, {
                    delay: { show: 300, hide: 300 } // 300ms show delay, 300ms hide delay
                });
            }
            return null; // Already initialized
        }).filter(tooltip => tooltip !== null); // Remove null values

        return tooltipList;
    },

    /**
     * Initialize popovers for elements with data-bs-toggle="popover".
     * Can be called on specific containers or the entire document.
     * @param {HTMLElement} container - Optional container element to search within. Defaults to document.
     */
    initializePopovers: function (container = document) {
        const popoverTriggerList = container.querySelectorAll('[data-bs-toggle="popover"]');
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => {
            // Check if popover is already initialized
            if (!popoverTriggerEl.hasAttribute('data-bs-popover-initialized')) {
                popoverTriggerEl.setAttribute('data-bs-popover-initialized', 'true');
                return new bootstrap.Popover(popoverTriggerEl, {
                    delay: { show: 300, hide: 300 } // 300ms show and hide delay
                });
            }
            return null; // Already initialized
        }).filter(popover => popover !== null); // Remove null values

        return popoverList;
    },
    
    /**
     * Returns requested param's value if set in url params.
     * @param {str} paramStr: which key are you requesting?
     */
    getQueryParam: function (paramStr) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(paramStr);
    }
};


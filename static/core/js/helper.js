import base from './helpers/base.js';
import validators from './helpers/validators.js';
import app from './helpers/app.js';
import ui from './helpers/ui.js';
import dom from './helpers/dom.js';
import forms from './helpers/forms.js';
import dates from './helpers/dates.js';
import constants from './constants.js';
import { showModal, updateUrlParam } from './lib/router.js';
import { Fetcher, defineRequest } from './lib/async.js';
import { Editor } from './lib/editor.js';
import { TabbedDashBoard } from './lib/dashboard.js';
import query from './lib/query.js';
import state from './lib/state/state.js';

let fetchedModules = {};

/**
 * Assembles all core libraries into one callable helper object.
 */
export default {
    data: constants,
    base: base,
    app: app,
    ui: ui,
    dom: dom,
    forms: forms,
    dates: dates,
    validators: validators,
    router: { 
        create: showModal,
        update: updateUrlParam
    },
    fetch: {
        route: defineRequest,
        body: Fetcher
    },
    editor: {
        make: Editor
    },
    dashboard: TabbedDashBoard,
    query: query,
    state: state,

    /**
     * Since meta is central to states, this meta object will serve as a shortcut to common operations of meta.
     */
    meta: {
        set: state.meta.set,
        get: state.meta.get,
        setMapper: state.meta.setMapper,
        getMapper: state.meta.getMapper,
    },

    components: async (appName) => {
        if (typeof appName !== 'string' || appName.length === 0) {
            console.warn('Error with ' + `${appName}-components` + ' load: App name must be string and non-zero length.');
            return null;
        }

        if (`${appName}-components` in fetchedModules) {
            return fetchedModules[`${appName}-components`].default;
        }

        try {
            fetchedModules[`${appName}-components`] = await import(`../../${appName}/js/components/index.js`);
            return fetchedModules[`${appName}-components`].default;
        } catch (err) {
            console.warn('Error with ' + `${appName}-components` + ' load: ', err);
            return null;
        }
    }
};

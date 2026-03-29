import generic from './helpers/generic.js';
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
import state from './lib/state.js';

/**
 * Assembles all core libraries into one callable helper object.
 */
export default {
    data: constants,
    generic: generic,
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
    state: state
};

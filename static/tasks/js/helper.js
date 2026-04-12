import helper from '../../core/js/helper.js';
import formsLocal from './helpers/forms.js';
import validators from './helpers/validate.js';
import data from './constants.js';
import components from './components/index.js';


/**
 * Assembles all core and tasks 'helpers' libraries into one callable helper object.
 */
const taskHelpers = {
    'tasks': {
        forms: formsLocal,
        validators: validators, // can carry validation specific to tasks
        data: data, // constants needed by tasks module.
        
        /**
         * Loads a compoenent specified with argument.
         * @param {str} component: name of specific component. Components in sub-folders should be denoted with a 'subfolder.componentName'
         */
        load: (commponent) => {
            return helper.app.load(commponent, 'tasks');
        },
    },
}

export default {
                ...helper,
                ...taskHelpers
}
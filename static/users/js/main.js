import { Main } from '../../core/js/app.js';
import $A from './helper.js';
import loginForm from './components/loginForm.js';


/**
 * Main will load the App for Users module/space.
 */
Main(async () => {
    //const loginForm = await $A.app.load('loginForm', 'users');
    loginForm(); // load login form functionaility
});

import $A from "../helper.js";

export default () => {
    // add 'clean form' functionality to all .open-form btns...
    const TasksO2OKeys = $A.app.memFetch('o2oTaskFields', true);
    const openFormBtn = document.querySelectorAll('.open-form');
    openFormBtn.forEach(button => {
        button.addEventListener('click', () => {
            $A.tasks.forms.cleanTaskForm('taskEditForm', TasksO2OKeys);
        });
    });
}
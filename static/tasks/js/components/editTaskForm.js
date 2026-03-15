import $A from "../helper.js";
import { UpdateTask, CreateTask } from '../crud/tasks.js';

export default function () {
    // Edit Task Modal: Save Operations Setup...
    // @todo: merge thid module and loadTaskFormValues + all 'task form functionality' components into one file.
    const editTaskSaveBtn = document.getElementById('taskEditFormSaveBtn');
    
    editTaskSaveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const tata_id = document.querySelector('#taskEditForm input[name="tata_id"]');
        if (!(tata_id instanceof HTMLElement)) {
            throw Error('Cannot find `tata_id` field, unable to perform edit/create operation.');
        }
        if(tata_id.value){
            UpdateTask('taskEditForm');
        }else{
            CreateTask('taskEditForm');
        }
    });
}
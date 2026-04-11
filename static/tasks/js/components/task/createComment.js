import { createCommentForTask } from "../../crud/comments.js";
import $A from "../../helper.js";

/**
 * implement rich-text editor and comments form.
 * @param {str} containerId 
 */
export default {
    default: {
        fetch: function (mapper, containerId) {
            this.component({}, containerId, mapper);
        },
        name: 'taskCreateComment',
        cache: false,

        component: function (data, containerId, mapper) {
            let container = $A.dom.containerElement(containerId);
            
            $A.editor.make('commentEditor');
            let saveCommentBtn = $A.dom.searchElementCorrectly('#saveComment', container);
            $A.state.dom.addMapperArguments(saveCommentBtn, 'tata-id', mapper.tata_id);
            
            $A.app.eventListener('click', saveCommentBtn, (e) => {
                e.preventDefault();
                let btn = e.currentTarget;
                let editorField = $A.dom.searchElementCorrectly('#commentEditor', container);
                let hiddenCommentField = $A.dom.searchElementCorrectly('#comment', container);
                let taskIdField = $A.dom.searchElementCorrectly('#task_id', container);
                hiddenCommentField.value = editorField.innerHTML;
                taskIdField.value = btn.dataset.stateMapperTataId;
                
                let dictionary = $A.tasks.forms.generateDictionaryFromForm(container.id + 'Form');
                $A.state.dom.addMapperArguments(container, 'confirm-message', 'Your comment has been posted.');
                $A.state.crud.create('taco', dictionary, container);
            });
        }
    }
}

import $A from "../../helper.js";

export default {
    default: {
        fetch: function (mapper, containerId) {
            $A.query().read('taco', { task_id: mapper.tata_id })
                .execute(containerId, this, mapper);
        },
        name: 'taskComments',
        mapper: ['tata_id'],
        tbls: ['taco'],
        identifier: ['tata_id'],

        component: function (comments, containerId) {
            let container = $A.dom.containerElement(containerId);
            let comment = $A.dom.searchElementCorrectly('#commmentContainer', container);
            
            $A.ui.handleEmptyData(comments, container);
            container.appendChild(comment);

            comments.forEach(item => {
                let newComment = $A.ui.embedData(item, comment.cloneNode(true), true);
                const user = $A.app.user(item.commenter_id, containerId);
                newComment.querySelector('.embed.creator_id').textContent = '' + user.username + ' wrote...';
                newComment.classList.remove('d-none');
                container.appendChild(newComment);
            });
        }
    },

    /**
     * implement rich-text editor and comments form.
     */
    create: {
        name: 'taskComments.createForm',
        mapper: ['tata_id'],
        cache: false,

        component: function (data, containerId, mapper) {
            let container = $A.dom.obtainElementCorrectly('taskCreateComment');
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

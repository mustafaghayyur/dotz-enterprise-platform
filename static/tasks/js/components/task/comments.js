import $A from "../../helper.js";


export default {
    default: {
        fetch: function (mapper, containerId) {
            $A.query().read('taco', { task_id: mapper.tata_id })
                .execute(containerId, this);
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
}

import $A from "../../helper.js";


export default {
    fetch: {
        default: function (mapper, containerId, componentName) {
            // fetch logic will be added here
        }
    },

    component: {
        default: function (comments, containerId) {
            let commentsContainer = $A.dom.containerElement(containerId);
            let commentCreator = $A.dom.searchElementCorrectly('#taskCreateComment', commentsContainer);
            let comment = $A.dom.searchElementCorrectly('#commmentContainer', commentsContainer);
            
            $A.ui.handleEmptyData(comments, commentsContainer);
            commentsContainer.appendChild(commentCreator);
            commentsContainer.appendChild(comment);

            comments.forEach(item => {
                let newComment = $A.ui.embedData(item, comment.cloneNode(true), true);
                const user = $A.app.user(item.commenter_id, containerId);
                newComment.querySelector('.embed.creator_id').textContent = '' + user.username + ' wrote...';
                newComment.classList.remove('d-none');
                commentsContainer.appendChild(newComment);
            });
        }
    }
}

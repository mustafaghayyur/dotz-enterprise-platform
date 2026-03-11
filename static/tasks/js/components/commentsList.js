import $A from "../helper.js";

export default function (data, containerId) {
    let container = $A.app.containerElement(containerId);
    let commentCreator = container.querySelector('#createComment');
    let comment = container.querySelector('#commmentContainer');
    container.innerHTML = '';
    container.appendChild(commentCreator);

    if ($A.generic.checkVariableType(data) === 'list') {
        let newComment = null;
        data.forEach(item => {
            newComment = comment.cloneNode(true);    
            newComment.classList.remove('d-none');

            newComment.querySelector('.creator_id').textContent = '' + item.commenter_id + 'wrote...';
            newComment.querySelector('.create_time').textContent = $A.dates.convertToDisplayLocal(item.create_time);
            newComment.querySelector('.update_time').textContent = $A.dates.convertToDisplayLocal(item.update_time);
            newComment.querySelector('.comment_text').innerHTML = $A.forms.escapeHtml(item.comment);

            container.appendChild(newComment);
        });
    }
}

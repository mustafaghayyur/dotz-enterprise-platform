import $A from "../helper.js";

/**
 * Allows for adding new comments.
 * @param {str} action: enum ['add']
 * @param {str} formId: html dom id attribute value for entire form.
 */
export async function createCommentForTask(formId) {
    let dictionary = $A.tasks.forms.generateDictionaryFromForm(formId);
    $A.query().create('taco', dictionary, true).execute('commentsResponse', (data, containerId) => {
        $A.app.generateResponseToAction(containerId, 'Your comment has been saved.');
    });
}

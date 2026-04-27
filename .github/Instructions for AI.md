Instructions for AI
===========================


I wish you to implement a full kabana-style task management dashboard in the following to files:

    - static/tasks/components/managementDashboard.js: should hold the full JS logic

    - templates/tasks/workspaceManager.html: should hold the initial HTML DOM, which you manipulate in managementDashboard.js to implement the kabana-style dashboard.

# Points to note...

1) The management-dashboard will hold "bubbles" or "boxes" that in the back-end are referred to as task-terms. Each bubble will be a term that has been created in the back end ... and will be represented by a box/bubble in the UI, where the user can drag-and-drop tasks into to organize the tasks.

2) all tasks that have not been organized into a term yet, will "float" or pile up at the bottom of the dahboard as "back-log" tasks.

3) We will ideally use Sortable library for all dragging-and-dropping features. Though I am open to other recommendations. Please use Bootstrap classes and icons.

4) The Term bubbles should also have a "handle" at the top-left or bottom-right corner to drag them around.

5) each term-bubble will stack-up side-by-side in a four-column grid. So since the Management Dashboard is full-screen, we will make each bubble a col-md-3 box. The bubbles should obviously be stack-able in mobile view...

6) the workspaceManagementDashboard component should be limited to the features I have mentioned. Assume term-creation, task-creation, and all non-mentioned features will be developed in other components. This component should soley focus on stated asks.

7) You are free to make an unlimited number of child and orphan components in the file. If you are uncomfortable with the component structure of organizing code, feel free to create simple functions and call them as regular functions ... I will organize those functions into sub-cmoponents myself afterwards.

8) Some models have not been fully-architeched yet, so for the back-end queries just use your imagination, based on what I have asked. You of course have the task record, but the terms you can assume will be a in a table of their own with a tbl-key of "tatr" with fields like: "id", "name" (term-name) and "parent-term-id" (incase they become nested in the future), etc... I will fix them once my back-end has been finalized.

9) each task will be represented as a card with a heading of the task.description. And the deadline, creator-id and status in the card body. the task-card should also be draggable (as earlier noted), and can be dropped in any bucket.

10) Ideally I would like the ability to place terms inside other terms (like nested term-bubbles). But we can skip this ask for now, if you cannot squeeze it in. Lower-priority.

11) The bubbles can have a + and - collapse button on one-edge of the bubble and use the BS Collapse feature.

12) The bubbles can have a delete incon-btn as well. If a bubble is deleted, all tasks inside it simply become back-log items again (i think this can be achieved when you re-fresh the component, but I will leave the details to you).

13) I have already created btn-xs styles and used them in the dashboard-todo component refresh buttons, incase you wish to use them for styling.

14) The way our platform's UI has been designed so far is, I create the empty template elements in the *.html django template files, and select their containerId (which is accessible with the container variable I pre-defined on line 30 of the workspaceManagementDashboard.js file). Once you have container, you can duplicate any child clements, pref-ill them as you need. I hope you can continue using this convention.

15) You are more than welcome to use as many $A utilities. However, I understand you would be most comfortable using your own JS knowledge. Use whatever conventions that suite you. I will simply sub-in my $A helper functions later, if I feel necessary.

16) Please use all component files in static/task/js/components/ as examples of what you can do with the $A library. Please don't use components/worspace/userData.js and components/worspace/departs.js as examples, since their logic is in-complete.
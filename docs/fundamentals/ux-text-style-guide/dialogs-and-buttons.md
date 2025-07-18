# Dialogs and buttons

## Clear title and button options

- Concise and descriptive dialog title: Add user
- Keep title of dialog generic and do not enter instance names as their length cannot be controlled, e.g. 'Delete building' instead of 'Delete Wittelsbacherplatz München'
- Avoid over-generic terms like ‘items’
- Option buttons should describe what will happen and relate to the dialog title: Cancel, Add
- Forms: When asking for user input using a dialog and there is no clear action verb in the title, provide Cancel and Save as buttons
- One button only reflects one action
- Users should be able to understand the choices based on the title and button text alone
- Avoid using ‘Yes’ and ‘No’ as buttons, but instead use suitable verbs to make the action directly understandable
- Only use ‘OK’ as an option if you cannot find an appropriate verb

<!-- markdownlint-disable MD033 -->
| Dos                                              | Don'ts                                         |
|--------------------------------------------------|------------------------------------------------|
| Title: Add user<br>Buttons: Cancel, Add          | Title: Add user<br>Buttons: Cancel, OK         |
| Title: Delete file<br>Buttons: Cancel, Delete    | Title: Are you sure<br>Buttons: Cancel, Delete |
| Title: Edit details<br>Buttons: Cancel, Save     | Title: Edit details<br>Buttons: Cancel, Edit   |
| Title: Unsaved changes<br>Buttons: Cancel, Save  | Title: Unsaved changes<br>Buttons: No, Yes     |
| Title: Delete devices<br>Buttons: Cancel, Delete | Title: Delete items<br>Buttons: Cancel, Delete |
<!-- markdownlint-enable MD033 -->

## Primary and secondary actions

- Primary on the right, secondary left (Cancel, OK) not (OK, Cancel)
- Primary actions can either be positive (Send, Save) or negative (Delete)

| Dos          | Don'ts       |
|-- -----------|--------------|
| Cancel, Save | Save, Cancel |

## Clear content

- In confirmation dialogs, formulate a question that is aimed at the primary action and ideally contains the verb of the primary button
- Keep content as concise and descriptive as possible
- Avoid to repeat the title
- Only include disclaimers if they are not implicitly part of the main content and if the amount of work required to recreate the current situation is high
- Check whether a disclaimer can be prevented by a different interaction
- Only use ‘this action’ in disclaimers

<!-- markdownlint-disable MD033 -->
| Dos                                             | Don'ts                                                                 |
|-------------------------------------------------|------------------------------------------------------------------------|
| Delete Wittelsbacherplatz München?              | Do you really want to delete Wittelsbacherplatz München?               |
| Delete Wittelsbacherplatz München?              | Delete Building?                                                       |
| Delete Wittelsbacherplatz München?              | Delete Wittelsbacherplatz München?<br><br>This action cannot be undone |
| Delete Wittelsbacherplatz München?              | Delete Wittelsbacherplatz München permanently?                         |
<!-- markdownlint-enable MD033 -->

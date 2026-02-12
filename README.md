CRUD Implementation Checklist
1. Users (users)
[ ] Create: Register a new user (Ensure password hashing!).

[ ] Read: Get user profile by uuid or username.

[ ] Update: Change password or update email.

[ ] Delete: Remove user (Warning: This will cascade delete their presentations).

2. Presentations (presentations)
[ ] Create: Start a new presentation linked to a user_id.

[ ] Read (List): Get all presentations owned by a specific user.

[ ] Read (Single): Get presentation details by uuid.

[ ] Update: Change the title.

[ ] Delete: Remove presentation (Cascades to slides, access, and contexts).

3. Slides (slides)
[ ] Create: Add a new slide to a presentation.

[ ] Read: Get all slides for a specific presentation_id (Sorted by slide_order).

[ ] Update: Edit slide content or reorder (slide_order).

[ ] Delete: Remove a specific slide.

4. Contexts & Files (contexts & files)
[ ] Create Context: Link a prompt or AI context to a presentation.

[ ] Create File: Upload and link a file to a specific context_uuid.

[ ] Read: Fetch the context and associated files for a presentation.

[ ] Update: Update the prompt or file storage_key.

[ ] Delete: Clean up files and context metadata.

5. Access Management (presentations_access)
[ ] Create: Grant view or edit access to another user.

[ ] Read: List everyone who has access to a specific presentation.

[ ] Update: Change access_type_enum or extend expires_at.

[ ] Delete: Revoke access for a specific user.
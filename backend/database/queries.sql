SELECT
    user_id,
    username,
    email,
    presentation_title,
    created_at,
    slide_id,
    slide_content
FROM users u
WHERE
    u.uuid =
    LEFT JOIN presentations p ON o.user_id = u.uuid
    LEFT JOIN slides s ON p.uuid = s.presentation_id;
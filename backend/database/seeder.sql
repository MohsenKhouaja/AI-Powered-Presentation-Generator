-- Seeder for Presentation Generator (No Stored Procedures)
-- This version uses a JavaScript-style approach that works with Node.js

-- Create temporary variables table for iterations
CREATE TEMPORARY TABLE IF NOT EXISTS temp_numbers (n INT);

INSERT INTO temp_numbers VALUES (1), (2), (3), (4), (5);

-- Seed Users (5 users)
INSERT INTO
    users (
        uuid,
        username,
        email,
        password
    )
VALUES (
        'user-001',
        'user',
        'user@gmail.com',
        '$2b$10$rZLNEWEXz3bF3Q3qV8W8puqBE.VhL5JxJxJxJxJxJxJxJxJxJxJxJ'
    ),
    (
        'user-002',
        'user',
        'user@gmail.com',
        '$2b$10$rZLNEWEXz3bF3Q3qV8W8puqBE.VhL5JxJxJxJxJxJxJxJxJxJxJxJ'
    ),
    (
        'user-003',
        'user',
        'user@gmail.com',
        '$2b$10$rZLNEWEXz3bF3Q3qV8W8puqBE.VhL5JxJxJxJxJxJxJxJxJxJxJxJ'
    ),
    (
        'user-004',
        'user',
        'user@gmail.com',
        '$2b$10$rZLNEWEXz3bF3Q3qV8W8puqBE.VhL5JxJxJxJxJxJxJxJxJxJxJxJ'
    ),
    (
        'user-005',
        'user',
        'user@gmail.com',
        '$2b$10$rZLNEWEXz3bF3Q3qV8W8puqBE.VhL5JxJxJxJxJxJxJxJxJxJxJxJ'
    );

-- Create temp table for presentations (3 per user)
CREATE TEMPORARY TABLE IF NOT EXISTS temp_pres_numbers (n INT);

INSERT INTO temp_pres_numbers VALUES (1), (2), (3);

-- Seed Presentations (3 presentations per user = 15 total)
INSERT INTO
    presentations (uuid, title, user_id)
SELECT UUID() as uuid, CONCAT(
        'Tech Deep Dive: Topic ', p.n, ' (User ', u.username, ')'
    ) as title, u.uuid as user_id
FROM users u
    CROSS JOIN temp_pres_numbers p;

-- Create temp table for slides (10 per presentation)
CREATE TEMPORARY TABLE IF NOT EXISTS temp_slide_numbers (n INT);

INSERT INTO
    temp_slide_numbers
VALUES (1),
    (2),
    (3),
    (4),
    (5),
    (6),
    (7),
    (8),
    (9),
    (10);

-- Seed Slides - Slide 1 (Intro)
INSERT INTO
    slides (
        uuid,
        content,
        presentation_id,
        slide_order
    )
SELECT UUID(), CONCAT(
        '# Welcome to Presentation\n', '## An Architectural Overview\n\n', 'In this session, we will explore the **fundamental principles** of modern software engineering. ', 'We aim to deconstruct complex patterns into digestible modules. By the end of this talk, you will understand:\n\n', '* Scalability patterns\n', '* State management\n', '* Asynchronous workflows\n\n', 'Let us begin our journey into the _depths_ of the system.'
    ), p.uuid, 1
FROM presentations p;

-- Seed Slides - Slides 2 & 6 (Code blocks)
INSERT INTO
    slides (
        uuid,
        content,
        presentation_id,
        slide_order
    )
SELECT UUID(), CONCAT(
        '# Implementation Details\n', '## The React Hook Pattern\n\n', 'Here is how we handle the layout effect resizing logic. Note the use of `useLayoutEffect` to prevent layout thrashing.\n\n', '```typescript\n', 'import { useLayoutEffect, useRef } from "react";\n\n', 'export const useAutoResize = (ref: any) => {\n', '  useLayoutEffect(() => {\n', '    if (!ref.current) return;\n', '    // Calculate optimal font size logic here\n', '    const height = ref.current.scrollHeight;\n', '    console.log("Resized to:", height);\n', '  }, [ref]);\n', '};\n', '```\n\n', 'This code snippet ensures the slide content fits perfectly within the viewport container.'
    ), p.uuid, s.n
FROM presentations p
    CROSS JOIN (
        SELECT 2 as n
        UNION
        SELECT 6
    ) s;

-- Seed Slides - Slides 3 & 7 (Blockquotes)
INSERT INTO
    slides (
        uuid,
        content,
        presentation_id,
        slide_order
    )
SELECT UUID(), CONCAT(
        '# Critical Observations\n', '## Performance Metrics\n\n', 'When analyzing the rendering pipeline, we noticed a significant drop in FPS when using unoptimized regex parsers.\n\n', '> Optimization is not about doing less work, it is about doing the work smarter. Always measure before you optimize.\n\n', 'This insight led us to adopt **memoization techniques** across the board. The impact was immediate and measurable, reducing TTI by 40%.'
    ), p.uuid, s.n
FROM presentations p
    CROSS JOIN (
        SELECT 3 as n
        UNION
        SELECT 7
    ) s;

-- Seed Slides - Slides 4 & 8 (Tables)
INSERT INTO
    slides (
        uuid,
        content,
        presentation_id,
        slide_order
    )
SELECT UUID(), CONCAT(
        '# Data Comparison\n', '## SQL vs NoSQL Benchmarks\n\n', 'The following table illustrates the performance characteristics observed during our load testing phase.\n\n', '| Metric | PostgreSQL | MongoDB | Redis |\n', '| :--- | :--- | :--- | :--- |\n', '| **Write Speed** | 12ms | 8ms | 0.5ms |\n', '| **Read Speed** | 5ms | 4ms | 0.1ms |\n', '| **Consistency** | Strong | Eventual | Strong |\n', '| **Complex Joins** | Excellent | Poor | N/A |\n\n', 'As clearly shown, caching layers provide the necessary speed for real-time applications.'
    ), p.uuid, s.n
FROM presentations p
    CROSS JOIN (
        SELECT 4 as n
        UNION
        SELECT 8
    ) s;

-- Seed Slides - Slides 5 & 9 (Task lists)
INSERT INTO
    slides (
        uuid,
        content,
        presentation_id,
        slide_order
    )
SELECT UUID(), CONCAT(
        '# Roadmap & Tasks\n', '## Q4 Deliverables\n\n', 'To ensure project success, we have outlined the following checklist. Please review these items carefully.\n\n', '* [x] Database schema migration\n', '* [x] API authentication setup\n', '* [ ] Frontend integration testing\n', '* [ ] User acceptance testing (UAT)\n\n', 'We are currently blocked on **infrastructure provisioning**, but the DevOps team is actively resolving the ticket.'
    ), p.uuid, s.n
FROM presentations p
    CROSS JOIN (
        SELECT 5 as n
        UNION
        SELECT 9
    ) s;

-- Seed Slides - Slide 10 (Summary with image)
INSERT INTO
    slides (
        uuid,
        content,
        presentation_id,
        slide_order
    )
SELECT UUID(), CONCAT(
        '# Summary\n', '## Key Takeaways\n\n', 'Thank you for attending. We have covered a significant amount of ground today regarding system architecture.\n\n', '![Architecture Diagram](https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80)\n\n', 'Remember to **star the repository** and check the documentation for further details. Questions?'
    ), p.uuid, 10
FROM presentations p;

-- Clean up temporary tables
DROP TEMPORARY TABLE IF EXISTS temp_numbers;

DROP TEMPORARY TABLE IF EXISTS temp_pres_numbers;

DROP TEMPORARY TABLE IF EXISTS temp_slide_numbers;

-- Display results
SELECT 'Seeding completed successfully!' as status;

SELECT COUNT(*) as total_users FROM users;

SELECT COUNT(*) as total_presentations FROM presentations;

SELECT COUNT(*) as total_slides FROM slides;
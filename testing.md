# Manual Test Checklist — Database Constraints

## Users
| # | Test | Expected |
|---|------|----------|
| 1 | Register with an existing **username** | Rejected (unique) |
| 2 | Register with an existing **email** | Rejected (unique) |
| 3 | Register without `username` / `email` / `password` | Rejected (not null) |

## Presentations
| # | Test | Expected |
|---|------|----------|
| 4 | Create presentation with a non-existent `userId` | FK violation |
| 5 | Delete a user → their presentations are deleted | Cascade OK |
| 6 | Create presentation without a `title` | Rejected (not null) |

## Contexts (1:1 with presentation)
| # | Test | Expected |
|---|------|----------|
| 7 | Create a **second** context for the same presentation | Rejected (unique on `presentationId`) |
| 8 | Create a context for a non-existent `presentationId` | FK violation |
| 9 | Delete a presentation → its context is deleted | Cascade OK |
| 10 | Create a context with an empty `prompt` | Allowed (default `""`) |

## Slides
| # | Test | Expected |
|---|------|----------|
| 11 | Insert two slides with the **same** `slide_order` in one presentation | Rejected (unique on `presentationId, slideOrder`) |
| 12 | Insert slides with same `slide_order` in **different** presentations | Allowed (per-presentation scope) |
| 13 | Delete a presentation → its slides are deleted | Cascade OK |
| 14 | Create a slide without a `slide_order` | Rejected (not null) |

## Files
| # | Test | Expected |
|---|------|----------|
| 15 | Create a file for a non-existent `contextId` | FK violation |
| 16 | Delete a context → its files are deleted | Cascade OK |
| 17 | Create a file without `fileName` / `mimeType` / `sizeBytes` / `originalName` | Rejected (not null) |

## Edit Access
| # | Test | Expected |
|---|------|----------|
| 18 | Grant edit access to the same (user, presentation) pair twice | Rejected (unique on `userId, presentationId`) |
| 19 | Grant edit access with a non-existent `userId` | FK violation |
| 20 | Grant edit access with a non-existent `presentationId` | FK violation |
| 21 | Delete a user → their edit_access rows are deleted | Cascade OK |
| 22 | Delete a presentation → its edit_access rows are deleted | Cascade OK |
| 23 | Create edit_access without `expiresAt` | Allowed (nullable) |

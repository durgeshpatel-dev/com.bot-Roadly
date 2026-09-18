# 05 — API SPECIFICATION

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** `https://<domain>/api`

## Response Format

All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "string",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": []
  }
}
```

## Authentication Headers

- **Access Token:** `Authorization: Bearer <access_token>`
- **Refresh Token:** Sent automatically as httpOnly cookie

---

## Auth Endpoints 🔴 REQUIRED

### POST /api/auth/signup

| Property | Value |
|----------|-------|
| **Purpose** | Register a new user account |
| **Auth Required** | ❌ No |
| **Authorization** | None |
| **Rate Limit** | 🟡 RECOMMENDED — 5 requests/15 min per IP |

**Request Body:**
```json
{
  "name": "string (required, 2-50 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "confirmPassword": "string (required, must match password)"
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "user",
      "isVerified": false
    },
    "message": "Registration successful. Please verify your email."
  }
}
```

**Error Responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 409 | `CONFLICT` | Email already registered |

---

### POST /api/auth/verify-email

| Property | Value |
|----------|-------|
| **Purpose** | Verify user email with token |
| **Auth Required** | ❌ No |
| **Authorization** | None |

**Request Body:**
```json
{
  "token": "string (required)"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully."
  }
}
```

**Error Responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `INVALID_TOKEN` | Token invalid or expired |

---

### POST /api/auth/login

| Property | Value |
|----------|-------|
| **Purpose** | Authenticate user and issue tokens |
| **Auth Required** | ❌ No |
| **Authorization** | None |
| **Rate Limit** | 🟡 RECOMMENDED — 10 requests/15 min per IP |

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response:** `200 OK`
- Sets `refreshToken` httpOnly cookie
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "isVerified": true
    },
    "accessToken": "string (JWT, 15min)"
  }
}
```

**Error Responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Missing fields |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |

**Security Notes:**
- Never reveal whether the email exists or the password is wrong — use generic "Invalid credentials"
- Set refresh token in httpOnly, Secure (prod), SameSite=Strict cookie

---

### POST /api/auth/refresh

| Property | Value |
|----------|-------|
| **Purpose** | Get new access token using refresh token |
| **Auth Required** | ❌ No (uses cookie) |
| **Authorization** | None |
| **Cookie Required** | `refreshToken` httpOnly cookie |

**Request Body:** None (token from cookie)

**Success Response:** `200 OK`
- Sets new `refreshToken` httpOnly cookie (rotation)
```json
{
  "success": true,
  "data": {
    "accessToken": "string (new JWT, 15min)"
  }
}
```

**Error Responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `INVALID_TOKEN` | No cookie, invalid token, or expired |

**Security Notes:**
- Implements token rotation: old refresh token deleted, new one issued
- If a used (deleted) token is presented → revoke ALL user tokens (theft detection)

---

### POST /api/auth/logout

| Property | Value |
|----------|-------|
| **Purpose** | Invalidate refresh token and log out |
| **Auth Required** | ✅ Yes |
| **Authorization** | Any authenticated user |

**Request Body:** None

**Success Response:** `200 OK`
- Clears `refreshToken` cookie
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully."
  }
}
```

---

### POST /api/auth/forgot-password

| Property | Value |
|----------|-------|
| **Purpose** | Request password reset email (simulated) |
| **Auth Required** | ❌ No |
| **Authorization** | None |
| **Rate Limit** | 🟡 RECOMMENDED — 3 requests/15 min per IP |

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Success Response:** `200 OK` (always, to prevent email enumeration)
```json
{
  "success": true,
  "data": {
    "message": "If this email exists, a password reset link has been sent."
  }
}
```

---

### POST /api/auth/reset-password

| Property | Value |
|----------|-------|
| **Purpose** | Reset password using token |
| **Auth Required** | ❌ No |
| **Authorization** | None |

**Request Body:**
```json
{
  "token": "string (required)",
  "password": "string (required, min 8 chars)",
  "confirmPassword": "string (required, must match)"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Password reset successful. Please log in."
  }
}
```

**Error Responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `INVALID_TOKEN` | Token invalid or expired |
| 400 | `VALIDATION_ERROR` | Password doesn't meet requirements |

**Security Notes:** Invalidates all refresh tokens for the user after password reset.

---

## User Endpoints

### GET /api/users/me

| Property | Value |
|----------|-------|
| **Purpose** | Get current authenticated user's profile |
| **Auth Required** | ✅ Yes |
| **Authorization** | Any authenticated user |

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "isVerified": true,
      "createdAt": "ISO date"
    }
  }
}
```

---

## Feature Request Endpoints 🔴 REQUIRED

### POST /api/posts

| Property | Value |
|----------|-------|
| **Purpose** | Create a new feature request |
| **Auth Required** | ✅ Yes |
| **Authorization** | Any authenticated user |

**Request Body:**
```json
{
  "title": "string (required, 5-150 chars)",
  "description": "string (required, 20-5000 chars)",
  "categories": ["string (required, min 1, enum: ui-ux, integrations, performance, general)"]
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "post": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "author": { "_id": "string", "name": "string" },
      "categories": ["string"],
      "status": "under-review",
      "voteCount": 0,
      "commentCount": 0,
      "voters": [],
      "createdAt": "ISO date"
    }
  }
}
```

**Error Responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 401 | `UNAUTHORIZED` | Not authenticated |

---

### GET /api/posts

| Property | Value |
|----------|-------|
| **Purpose** | Get paginated list of feature requests |
| **Auth Required** | ❌ No (public feed) |
| **Authorization** | None |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 50) |
| `sort` | string | `newest` | `newest`, `most-voted`, `most-discussed` |
| `category` | string | — | Comma-separated: `ui-ux,performance` |
| `status` | string | — | Comma-separated: `planned,in-progress` |
| `search` | string | — | Full-text search query |

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "author": { "_id": "string", "name": "string" },
        "categories": ["string"],
        "status": "string",
        "voteCount": 0,
        "commentCount": 0,
        "hasVoted": false,
        "createdAt": "ISO date"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Notes:**
- `hasVoted` is computed per-request for authenticated users (check if user ID is in voters array). For unauthenticated users, always `false`.
- Description may be truncated in list view (first 200 chars) — 🟠 IMPLEMENTATION DECISION

---

### GET /api/posts/:id

| Property | Value |
|----------|-------|
| **Purpose** | Get single feature request with full details |
| **Auth Required** | ❌ No (public) |
| **Authorization** | None |

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "post": {
      "_id": "string",
      "title": "string",
      "description": "string (full Markdown)",
      "author": { "_id": "string", "name": "string" },
      "categories": ["string"],
      "status": "string",
      "voteCount": 0,
      "commentCount": 0,
      "hasVoted": false,
      "voters": ["userId"],
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  }
}
```

**Error Responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 404 | `NOT_FOUND` | Post does not exist |

---

### PUT /api/posts/:id

| Property | Value |
|----------|-------|
| **Purpose** | Update a feature request (author or admin) |
| **Auth Required** | ✅ Yes |
| **Authorization** | Post author OR admin |

**Request Body:**
```json
{
  "title": "string (optional, 5-150 chars)",
  "description": "string (optional, 20-5000 chars)",
  "categories": ["string (optional)"]
}
```

**Error Responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 403 | `FORBIDDEN` | Not author or admin |
| 404 | `NOT_FOUND` | Post does not exist |

---

### DELETE /api/posts/:id

| Property | Value |
|----------|-------|
| **Purpose** | Delete a feature request (author or admin) |
| **Auth Required** | ✅ Yes |
| **Authorization** | Post author OR admin |

**Success Response:** `200 OK`

**Notes:** Also deletes all associated comments and adjusts related data.

---

## Voting Endpoints 🔴 REQUIRED

### POST /api/posts/:id/vote

| Property | Value |
|----------|-------|
| **Purpose** | Toggle vote on a feature request (upvote or remove vote) |
| **Auth Required** | ✅ Yes |
| **Authorization** | Any authenticated user |

**Request Body:** None

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "hasVoted": true,
    "voteCount": 15
  }
}
```

**Error Responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `UNAUTHORIZED` | Not authenticated |
| 404 | `NOT_FOUND` | Post does not exist |

**Implementation Notes:**
- Uses atomic MongoDB `$addToSet` / `$pull` + `$inc`
- Toggle behavior: If user hasn't voted → upvote. If already voted → remove vote.
- Returns updated vote state for frontend reconciliation

---

## Comment Endpoints 🔴 REQUIRED

### POST /api/posts/:postId/comments

| Property | Value |
|----------|-------|
| **Purpose** | Add a comment to a feature request |
| **Auth Required** | ✅ Yes |
| **Authorization** | Any authenticated user |

**Request Body:**
```json
{
  "content": "string (required, 1-2000 chars, Markdown)",
  "parentComment": "string (optional, ObjectId of parent comment for replies)"
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "string",
      "content": "string",
      "author": { "_id": "string", "name": "string" },
      "post": "string",
      "parentComment": "string|null",
      "isEdited": false,
      "createdAt": "ISO date"
    }
  }
}
```

**Validation:**
- If `parentComment` is provided, verify it exists and belongs to the same post
- Enforce max thread depth (2 levels) — reject if parentComment is itself a reply

---

### GET /api/posts/:postId/comments

| Property | Value |
|----------|-------|
| **Purpose** | Get all comments for a feature request |
| **Auth Required** | ❌ No (public) |
| **Authorization** | None |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page of top-level comments |
| `limit` | number | 20 | Top-level comments per page |

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "string",
        "content": "string",
        "author": { "_id": "string", "name": "string" },
        "parentComment": null,
        "isEdited": false,
        "createdAt": "ISO date",
        "replies": [
          {
            "_id": "string",
            "content": "string",
            "author": { "_id": "string", "name": "string" },
            "parentComment": "string",
            "isEdited": false,
            "createdAt": "ISO date"
          }
        ]
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

**Notes:** Replies are nested under their parent comment in the response. Pagination applies to top-level comments; all replies for visible top-level comments are included.

---

### PUT /api/comments/:id

| Property | Value |
|----------|-------|
| **Purpose** | Edit a comment |
| **Auth Required** | ✅ Yes |
| **Authorization** | Comment author OR admin |

**Request Body:**
```json
{
  "content": "string (required, 1-2000 chars)"
}
```

**Notes:** Sets `isEdited: true`

---

### DELETE /api/comments/:id

| Property | Value |
|----------|-------|
| **Purpose** | Delete a comment |
| **Auth Required** | ✅ Yes |
| **Authorization** | Comment author OR admin |

**Success Response:** `200 OK`

**Notes:** Decrements `commentCount` on parent post. If comment has replies, 🟠 IMPLEMENTATION DECISION — soft-delete showing "[deleted]" or cascade delete replies.

---

## Roadmap Endpoints 🔴 REQUIRED

### GET /api/roadmap

| Property | Value |
|----------|-------|
| **Purpose** | Get feature requests grouped by roadmap status |
| **Auth Required** | ❌ No (public roadmap) |
| **Authorization** | None |

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "planned": [
      {
        "_id": "string",
        "title": "string",
        "categories": ["string"],
        "voteCount": 10,
        "commentCount": 3
      }
    ],
    "in-progress": [],
    "completed": []
  }
}
```

**Notes:** Returns posts with status `planned`, `in-progress`, `completed` grouped into three arrays. Excludes `under-review` (those are in the feed/admin panel). Each group sorted by `voteCount` descending (🟠 IMPLEMENTATION DECISION).

---

## Admin Endpoints 🔴 REQUIRED

### PATCH /api/admin/posts/:id/status

| Property | Value |
|----------|-------|
| **Purpose** | Change the status of a feature request |
| **Auth Required** | ✅ Yes |
| **Authorization** | Admin only |

**Request Body:**
```json
{
  "status": "string (required, enum: under-review, planned, in-progress, completed)"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "post": {
      "_id": "string",
      "status": "planned",
      "updatedAt": "ISO date"
    }
  }
}
```

**Error Responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 403 | `FORBIDDEN` | Not admin |
| 404 | `NOT_FOUND` | Post does not exist |

---

### GET /api/admin/posts

| Property | Value |
|----------|-------|
| **Purpose** | Get all feature requests with admin view (all statuses, management data) |
| **Auth Required** | ✅ Yes |
| **Authorization** | Admin only |

Same query parameters as `GET /api/posts` but includes all management-relevant data.

---

## Search Endpoints 🔴 REQUIRED

Search is integrated into `GET /api/posts` via the `search` query parameter rather than a separate endpoint. This simplifies the API — search results still support filtering, sorting, and pagination.

---

## Endpoint Summary Table

| Method | Path | Auth | Role | Purpose | Classification |
|--------|------|------|------|---------|---------------|
| POST | `/api/auth/signup` | ❌ | — | Register | 🔴 REQUIRED |
| POST | `/api/auth/verify-email` | ❌ | — | Verify email | 🔴 REQUIRED |
| POST | `/api/auth/login` | ❌ | — | Login | 🔴 REQUIRED |
| POST | `/api/auth/refresh` | ❌ | — | Refresh token | 🔴 REQUIRED |
| POST | `/api/auth/logout` | ✅ | Any | Logout | 🔴 REQUIRED |
| POST | `/api/auth/forgot-password` | ❌ | — | Forgot password | 🔴 REQUIRED |
| POST | `/api/auth/reset-password` | ❌ | — | Reset password | 🔴 REQUIRED |
| GET | `/api/users/me` | ✅ | Any | Current user | 🟡 RECOMMENDED |
| POST | `/api/posts` | ✅ | Any | Create request | 🔴 REQUIRED |
| GET | `/api/posts` | ❌ | — | List/search/filter | 🔴 REQUIRED |
| GET | `/api/posts/:id` | ❌ | — | Get request | 🔴 REQUIRED |
| PUT | `/api/posts/:id` | ✅ | Author/Admin | Update request | 🟡 RECOMMENDED |
| DELETE | `/api/posts/:id` | ✅ | Author/Admin | Delete request | 🟡 RECOMMENDED |
| POST | `/api/posts/:id/vote` | ✅ | Any | Toggle vote | 🔴 REQUIRED |
| POST | `/api/posts/:postId/comments` | ✅ | Any | Add comment | 🔴 REQUIRED |
| GET | `/api/posts/:postId/comments` | ❌ | — | List comments | 🔴 REQUIRED |
| PUT | `/api/comments/:id` | ✅ | Author/Admin | Edit comment | 🔴 REQUIRED |
| DELETE | `/api/comments/:id` | ✅ | Author/Admin | Delete comment | 🔴 REQUIRED |
| GET | `/api/roadmap` | ❌ | — | Public roadmap | 🔴 REQUIRED |
| PATCH | `/api/admin/posts/:id/status` | ✅ | Admin | Change status | 🔴 REQUIRED |
| GET | `/api/admin/posts` | ✅ | Admin | Admin post list | 🔴 REQUIRED |

# Authentication

The API supports two modes:

1. Development headers (if `ENVIRONMENT=development`)
   - `X-User-Id`: user id
   - `X-Org-Id`: organisation id
   - `X-Role`: one of `BROKER`, `BROKER_ADMIN`, `INTERNAL`
2. Bearer JWT (production)
   - `Authorization: Bearer <token>`
   - Token must include `user_id`, `organisation_id`, `role` claims and is validated with HS256 using `settings.JWT_SECRET`.

Role-based access control (RBAC) is enforced using `require_role()`.

```startLine:endLine:filepath
1:47:server/middleware/auth.py
```

```startLine:endLine:filepath
1:20:server/middleware/rbac.py
```

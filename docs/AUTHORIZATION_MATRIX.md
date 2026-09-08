# Account authorization matrix

This matrix records the Phase 2 account-management boundary. The backend is the
enforcement point; frontend route guards are navigation assistance only.

| Operation | Anonymous | User | Administrator |
| --- | --- | --- | --- |
| Sign in and register | Allowed | Allowed | Allowed |
| View own account | Denied | Own account only | Own account only |
| Edit profile or password | Denied | Own account only | Own account only |
| Request account deletion | Denied | Own account only | Own account only |
| List or inspect managed users | Denied | Denied | Allowed |
| Activate or delete an account | Denied | Denied | Allowed |
| Assign roles | Denied | Denied | Allowed |
| View or change role definitions | Denied | Denied | Allowed |
| Reset another user's password | Denied | Denied | Denied; feature removed |

State-changing account routes accept only their documented `DELETE`, `PUT` or
`POST` method. Their inherited `GET` variants are no longer available.

Deletion requests require the exact current account email, matching PostgreSQL's
case-sensitive lookup semantics. The update itself targets the authenticated
account ID, never a second lookup of the caller-supplied email. A differently
cased email can belong to a separate account and must not pass this check.

Project-level ownership and authorization are not defined by this matrix and
remain a separate product and security decision.

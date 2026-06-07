# PSSF — Authentication and Session Design

**Version:** 1.0  
**Status:** Approved for implementation  
**Library:** Auth.js (NextAuth v5)

---

## Overview

Authentication is split into two flows:

- **OTP flow** — Members and claimants log in using their registered phone number and a one-time code delivered via WhatsApp (Chatnation CRM)
- **Password + OTP flow** — Employer officers, PSSF staff, and administrators log in with email and password, confirmed with OTP as second factor

---

## Session Shape

Auth.js is configured to extend the default session with role and identity fields.

```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      name: string
      email?: string
      phone?: string
      employer_id?: string    // populated for EMPLOYER role
      member_id?: string      // populated for MEMBER and CLAIMANT roles
    }
  }

  interface JWT {
    id: string
    role: Role
    employer_id?: string
    member_id?: string
  }
}
```

The session JWT is stored as an httpOnly secure cookie. Sessions expire after 8 hours of inactivity. Staff sessions expire after 4 hours.

---

## OTP Flow (Members and Claimants)

### Step 1 — Enter phone number

User enters their registered mobile number on the login screen.

### Step 2 — Request OTP

```
POST /api/auth/request-otp
Body: { phone: "+254700000001" }
```

Server:
1. Looks up user by phone number
2. If not found, returns `{ matched: false }` — user must sign up first
3. If found, generates a 6-digit OTP
4. Stores OTP hash + expiry (5 minutes) in `otp_requests` table
5. Dispatches OTP to Chatnation CRM for WhatsApp delivery
6. Returns `{ message: "OTP sent", expires_in: 300 }`

### Step 3 — Enter OTP

```
POST /api/auth/verify-otp
Body: { phone: "+254700000001", code: "123456" }
```

Server:
1. Finds the most recent unexpired OTP for this phone
2. Compares hash of submitted code
3. If invalid: returns `OTP_INVALID` error
4. If expired: returns `OTP_EXPIRED` error
5. If valid: marks OTP as used, creates Auth.js session, returns session token

### OTP rules

- OTP is 6 digits
- OTP expires after 5 minutes
- Maximum 3 attempts per OTP before it is invalidated
- Maximum 5 OTP requests per phone number per hour
- OTP is single-use — verified OTPs cannot be reused

---

## Password + OTP Flow (Staff and Employers)

### Step 1 — Enter email and password

```
POST /api/auth/login
Body: { email: "officer@pssf.go.ke", password: "..." }
```

Server:
1. Looks up user by email
2. Verifies bcrypt password hash
3. If invalid: returns `UNAUTHORIZED`
4. If valid: generates OTP, dispatches to user's registered phone via Chatnation CRM
5. Returns `{ requires_otp: true, expires_in: 300 }`

### Step 2 — Enter OTP

```
POST /api/auth/verify-otp
Body: { email: "officer@pssf.go.ke", code: "123456" }
```

Server:
1. Verifies OTP as above
2. Creates Auth.js session with role and identity fields
3. Returns session

---

## Sign Up Flow (New Members)

Sign up is separate from login. It is an identity validation and account creation flow, not a case.

### Step 1 — Validate identity

```
POST /api/member/validate
Body: { national_id: "12345678", date_of_birth: "1980-05-15" }
```

Returns prefilled member data if a match exists in the seed database.

### Step 2 — Confirm contact details

Member reviews prefilled data. Editable fields (mobile, email, address) can be updated. Phone number change triggers OTP confirmation before saving.

### Step 3 — Set up access

Member selects login method:
- OTP only (default — phone number used at every login)
- Password (optional — sets a password in addition to OTP)

### Step 4 — OTP confirmation

OTP sent to registered phone number to verify ownership before account is activated.

### Step 5 — Account activated

User record created. Session started. Member redirected to their dashboard.

---

## Route Protection Middleware

Auth.js middleware enforces access at the route level before any page or API handler runs.

```typescript
// middleware.ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    "/member/:path*",
    "/employer/:path*",
    "/staff/:path*",
    "/admin/:path*",
    "/api/member/:path*",
    "/api/cases/:path*",
    "/api/approvals/:path*",
    "/api/documents/:path*",
    "/api/tasks/:path*",
    "/api/notifications/:path*",
    "/api/admin/:path*",
  ]
}
```

Role enforcement inside handlers:

```typescript
// lib/auth-guard.ts
export function requireRole(session: Session, ...roles: Role[]) {
  if (!session?.user) throw new AuthError("UNAUTHORIZED")
  if (!roles.includes(session.user.role)) throw new AuthError("FORBIDDEN")
}
```

---

## Role-Based Route Access

| Route prefix | Allowed roles |
|---|---|
| `/member/*` | MEMBER, CLAIMANT |
| `/employer/*` | EMPLOYER |
| `/staff/*` | PSSF_OFFICER, PSSF_SUPERVISOR |
| `/admin/*` | ADMIN |
| `/api/member/*` | MEMBER, CLAIMANT |
| `/api/cases/*` | All authenticated roles (scoped by service layer) |
| `/api/approvals/employer` | EMPLOYER |
| `/api/approvals/pssf` | PSSF_OFFICER, PSSF_SUPERVISOR |
| `/api/approvals/trustee` | PSSF_SUPERVISOR |
| `/api/documents/*` | All authenticated roles (scoped) |
| `/api/tasks/*` | All authenticated roles (scoped) |
| `/api/admin/*` | ADMIN |

---

## Auth.js Configuration

```typescript
// auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        // OTP flow and password flow both handled here
        // Returns user object or null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.member_id = user.member_id
        token.employer_id = user.employer_id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.member_id = token.member_id
      session.user.employer_id = token.employer_id
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60    // 8 hours
  }
})
```

---

## Security Rules

- Passwords are hashed with bcrypt, minimum cost factor 12
- OTP codes are stored as SHA-256 hashes — never plaintext
- Session tokens are httpOnly, Secure, SameSite=Strict cookies
- Failed login attempts are rate-limited: 5 attempts per 15 minutes per IP
- Phone number updates require OTP verification of the new number before saving
- Email changes require verification link sent to the new address before saving
- Staff accounts require ADMIN to create — self-registration is not available for any non-member role

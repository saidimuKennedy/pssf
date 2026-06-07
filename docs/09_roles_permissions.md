# PSSF — Role and Permission Matrix

**Version:** 1.0  
**Status:** Approved for implementation

---

## Roles

```
MEMBER
CLAIMANT
EMPLOYER
PSSF_OFFICER
PSSF_SUPERVISOR
ADMIN
```

---

## Permission Definitions

Each permission is a string identifier seeded into the `permissions` table. Roles reference permissions via a join table.

### Case permissions

| Permission | Description |
|---|---|
| `case:create` | Create a new case |
| `case:submit` | Submit a draft case |
| `case:read:own` | Read own cases only |
| `case:read:employer` | Read cases belonging to own employer |
| `case:read:all` | Read all cases |
| `case:update:form_data` | Update form data on a draft case |
| `case:submit_additional_info` | Respond to a more info request |
| `case:add_note` | Add an internal note to a case |
| `case:reassign` | Reassign a case to another officer |
| `case:close` | Close a completed or rejected case |
| `case:export` | Export a case record |

### Approval permissions

| Permission | Description |
|---|---|
| `approval:employer` | Record an employer approval decision |
| `approval:pssf` | Record a PSSF approval decision |
| `approval:trustee` | Record a trustee decision |

### Document permissions

| Permission | Description |
|---|---|
| `document:upload` | Upload a document to a case |
| `document:read:own` | Download own case documents |
| `document:read:employer` | Download documents from employer's cases |
| `document:read:all` | Download any document |
| `document:replace` | Replace an uploaded or rejected document |
| `document:verify` | Mark a document as verified |
| `document:reject` | Reject a document with a reason |

### Task permissions

| Permission | Description |
|---|---|
| `task:read:own` | Read own assigned tasks |
| `task:read:all` | Read all tasks |
| `task:complete` | Complete an assigned task |

### Member permissions

| Permission | Description |
|---|---|
| `member:validate` | Validate member by ID and DOB |
| `member:read:own` | Read own member profile |
| `member:update:contact` | Update contact fields on own profile |
| `member:read:contributions` | Read own contribution statement |

### Notification permissions

| Permission | Description |
|---|---|
| `notification:read:own` | Read own portal notifications |
| `notification:mark_read` | Mark a notification as read |

### Admin permissions

| Permission | Description |
|---|---|
| `admin:users:read` | List and view users |
| `admin:users:create` | Create new users |
| `admin:users:update` | Update user roles and status |
| `admin:employers:read` | List and view employers |
| `admin:employers:create` | Create employer records |
| `admin:audit:read` | Read audit trails |
| `admin:audit:export` | Export audit data |
| `admin:notifications:read` | Read notification rules |
| `admin:notifications:update` | Enable or disable notification rules |
| `admin:reports:read` | Access reports |

---

## Role to Permission Mapping

### MEMBER

```
case:create
case:submit
case:read:own
case:update:form_data
case:submit_additional_info
document:upload
document:read:own
document:replace
task:read:own
task:complete
member:validate
member:read:own
member:update:contact
member:read:contributions
notification:read:own
notification:mark_read
```

### CLAIMANT

```
case:create
case:submit
case:read:own
case:update:form_data
case:submit_additional_info
document:upload
document:read:own
document:replace
task:read:own
task:complete
member:validate
notification:read:own
notification:mark_read
```

### EMPLOYER

```
case:read:employer
approval:employer
document:upload
document:read:employer
task:read:own
task:complete
notification:read:own
notification:mark_read
```

### PSSF_OFFICER

```
case:read:all
case:add_note
case:export
approval:pssf
document:upload
document:read:all
document:verify
document:reject
task:read:all
task:complete
notification:read:own
notification:mark_read
```

### PSSF_SUPERVISOR

```
case:read:all
case:add_note
case:reassign
case:close
case:export
approval:pssf
approval:trustee
document:upload
document:read:all
document:replace
document:verify
document:reject
task:read:all
task:complete
admin:audit:read
admin:audit:export
admin:reports:read
notification:read:own
notification:mark_read
```

### ADMIN

```
case:read:all
case:export
document:read:all
task:read:all
admin:users:read
admin:users:create
admin:users:update
admin:employers:read
admin:employers:create
admin:audit:read
admin:audit:export
admin:notifications:read
admin:notifications:update
admin:reports:read
notification:read:own
notification:mark_read
```

---

## Seed Data for Permissions Table

```sql
INSERT INTO permissions (id, name) VALUES
  (gen_random_uuid(), 'case:create'),
  (gen_random_uuid(), 'case:submit'),
  (gen_random_uuid(), 'case:read:own'),
  (gen_random_uuid(), 'case:read:employer'),
  (gen_random_uuid(), 'case:read:all'),
  (gen_random_uuid(), 'case:update:form_data'),
  (gen_random_uuid(), 'case:submit_additional_info'),
  (gen_random_uuid(), 'case:add_note'),
  (gen_random_uuid(), 'case:reassign'),
  (gen_random_uuid(), 'case:close'),
  (gen_random_uuid(), 'case:export'),
  (gen_random_uuid(), 'approval:employer'),
  (gen_random_uuid(), 'approval:pssf'),
  (gen_random_uuid(), 'approval:trustee'),
  (gen_random_uuid(), 'document:upload'),
  (gen_random_uuid(), 'document:read:own'),
  (gen_random_uuid(), 'document:read:employer'),
  (gen_random_uuid(), 'document:read:all'),
  (gen_random_uuid(), 'document:replace'),
  (gen_random_uuid(), 'document:verify'),
  (gen_random_uuid(), 'document:reject'),
  (gen_random_uuid(), 'task:read:own'),
  (gen_random_uuid(), 'task:read:all'),
  (gen_random_uuid(), 'task:complete'),
  (gen_random_uuid(), 'member:validate'),
  (gen_random_uuid(), 'member:read:own'),
  (gen_random_uuid(), 'member:update:contact'),
  (gen_random_uuid(), 'member:read:contributions'),
  (gen_random_uuid(), 'notification:read:own'),
  (gen_random_uuid(), 'notification:mark_read'),
  (gen_random_uuid(), 'admin:users:read'),
  (gen_random_uuid(), 'admin:users:create'),
  (gen_random_uuid(), 'admin:users:update'),
  (gen_random_uuid(), 'admin:employers:read'),
  (gen_random_uuid(), 'admin:employers:create'),
  (gen_random_uuid(), 'admin:audit:read'),
  (gen_random_uuid(), 'admin:audit:export'),
  (gen_random_uuid(), 'admin:notifications:read'),
  (gen_random_uuid(), 'admin:notifications:update'),
  (gen_random_uuid(), 'admin:reports:read');
```

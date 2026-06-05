import { Role } from "@prisma/client"

export type { Role }

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      name?: string | null
      email?: string | null
      phone?: string | null
      employer_id?: string | null
      member_id?: string | null
    }
  }

  interface User {
    id: string
    role: Role
    phone?: string | null
    employer_id?: string | null
    member_id?: string | null
  }
}

// JWT fields are extended via next-auth module augmentation above
// The auth.ts callbacks explicitly populate these fields on the token

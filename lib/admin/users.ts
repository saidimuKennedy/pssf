import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/notifications/channels/email"

export interface ListUsersFilters {
  role?: Role
  status?: "active" | "inactive"
  search?: string
  page?: number
  limit?: number
}

export async function listUsers(filters: ListUsersFilters = {}) {
  const page = filters.page ?? 1
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20))
  const where: Record<string, unknown> = { deleted_at: null }

  if (filters.role) where.role = filters.role
  if (filters.status === "active") where.is_active = true
  if (filters.status === "inactive") where.is_active = false
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        member: { select: { full_name: true } },
        employer_officer: { select: { full_name: true, employer: { select: { name: true } } } },
      },
    }),
  ])

  return {
    total,
    page,
    limit,
    data: users.map((u) => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      is_active: u.is_active,
      created_at: u.created_at,
      name: u.member?.full_name ?? u.employer_officer?.full_name ?? u.email ?? u.phone,
    })),
  }
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      member: true,
      employer_officer: { include: { employer: true } },
    },
  })
  if (!user) return null
  return {
    ...user,
    name: user.member?.full_name ?? user.employer_officer?.full_name ?? user.email,
  }
}

export interface CreateUserInput {
  full_name: string
  email: string
  phone?: string
  role: Role
  employer_id?: string
}

export async function createAdminUser(input: CreateUserInput) {
  const tempPassword = nanoid(12)
  const password_hash = bcrypt.hashSync(tempPassword, 12)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone ?? null,
      password_hash,
      role: input.role,
      is_active: true,
    },
  })

  if (input.role === Role.EMPLOYER && input.employer_id) {
    await prisma.employerOfficer.create({
      data: {
        user_id: user.id,
        employer_id: input.employer_id,
        full_name: input.full_name,
        designation: "HR Officer",
      },
    })
  }

  const loginUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/login`
  await sendEmail({
    to: input.email,
    template_ref: "tpl_welcome_email",
    variables: {
      full_name: input.full_name,
      email: input.email,
      temp_password: tempPassword,
      login_url: loginUrl,
    },
  })

  return { userId: user.id, tempPassword }
}

export async function updateUser(
  userId: string,
  data: { role?: Role; is_active?: boolean; reset_password?: boolean }
) {
  const updates: Record<string, unknown> = {}
  if (data.role) updates.role = data.role
  if (data.is_active !== undefined) updates.is_active = data.is_active

  let tempPassword: string | undefined
  if (data.reset_password) {
    tempPassword = nanoid(12)
    updates.password_hash = bcrypt.hashSync(tempPassword, 12)
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
  })

  if (tempPassword && user.email) {
    await sendEmail({
      to: user.email,
      template_ref: "tpl_welcome_email",
      variables: {
        full_name: user.email,
        email: user.email,
        temp_password: tempPassword,
        login_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/login`,
      },
    })
  }

  return user
}

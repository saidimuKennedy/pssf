import { prisma } from "@/lib/db"
import { createAdminUser, type CreateUserInput } from "./users"
import { Role } from "@prisma/client"

export async function listEmployers(page = 1, limit = 20, search?: string) {
  const take = Math.min(100, Math.max(1, limit))
  const where = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { code: { contains: search, mode: "insensitive" as const } }] }
    : {}

  const [total, employers] = await Promise.all([
    prisma.employer.count({ where }),
    prisma.employer.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * take,
      take,
      include: {
        _count: { select: { officers: true, cases: true } },
      },
    }),
  ])

  return {
    total,
    page,
    limit: take,
    data: employers.map((e) => ({
      id: e.id,
      name: e.name,
      code: e.code,
      is_active: e.is_active,
      officer_count: e._count.officers,
      active_cases_count: e._count.cases,
      created_at: e.created_at,
    })),
  }
}

export async function getEmployerDetail(employerId: string) {
  return prisma.employer.findUnique({
    where: { id: employerId },
    include: {
      officers: {
        include: { user: { select: { id: true, email: true, is_active: true } } },
      },
      _count: { select: { cases: true } },
    },
  })
}

export async function createEmployer(data: {
  name: string
  code: string
  officer?: { full_name: string; email: string; phone?: string }
}) {
  const employer = await prisma.employer.create({
    data: { name: data.name, code: data.code },
  })

  if (data.officer) {
    await createAdminUser({
      full_name: data.officer.full_name,
      email: data.officer.email,
      phone: data.officer.phone,
      role: Role.EMPLOYER,
      employer_id: employer.id,
    })
  }

  return employer
}

export async function updateEmployer(employerId: string, data: { name?: string; is_active?: boolean }) {
  return prisma.employer.update({ where: { id: employerId }, data })
}

export async function addEmployerOfficer(
  employerId: string,
  officer: { full_name: string; email: string; phone?: string }
) {
  return createAdminUser({
    full_name: officer.full_name,
    email: officer.email,
    phone: officer.phone,
    role: Role.EMPLOYER,
    employer_id: employerId,
  })
}

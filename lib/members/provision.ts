import { prisma } from "@/lib/db"
import { CaseStatus, CaseType, type Member } from "@prisma/client"
import { generateCaseReference } from "@/lib/cases/reference"

// ---------------------------------------------------------------------------
// Demo data provisioning.
//
// Guarantees that any member who activates / logs in has a complete, working
// account across all member services — no empty ("—") fields anywhere. Every
// function here is idempotent: it only fills what is missing, so it is safe to
// call on every login.
// ---------------------------------------------------------------------------

const KENYAN_TOWNS = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Nyeri",
  "Machakos", "Kakamega", "Kisii", "Meru", "Kericho", "Embu", "Garissa",
]

const POSTAL_CODES: Record<string, string> = {
  Nairobi: "00100", Mombasa: "80100", Kisumu: "40100", Nakuru: "20100",
  Eldoret: "30100", Thika: "01000", Nyeri: "10100", Machakos: "90100",
  Kakamega: "50100", Kisii: "40200", Meru: "60200", Kericho: "20200",
  Embu: "60100", Garissa: "70100",
}

const FIRST_NAMES = [
  "James", "Mary", "Peter", "Grace", "John", "Faith", "Daniel", "Esther",
  "Samuel", "Ruth", "David", "Joyce", "Joseph", "Mercy", "Paul", "Ann",
]
const SURNAMES = [
  "Mwangi", "Otieno", "Kamau", "Wanjiru", "Kiprono", "Achieng", "Njoroge",
  "Mutua", "Cheruiyot", "Wafula", "Omondi", "Karanja", "Chebet", "Maina",
]

// Deterministic PRNG so a given member always gets the same generated values —
// stable across page refreshes and matching whatever is eventually persisted.
function makeRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

function makePickers(seed: string) {
  const rng = makeRng(seed)
  const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const randInt = (min: number, max: number): number =>
    Math.floor(min + rng() * (max - min + 1))
  return { pick, randInt }
}

/**
 * Deterministically derives a complete set of PSSF-specific field values for a
 * member, keyed on a stable seed (the national ID). Used both to persist new
 * members and to fill enrolment prefills for members who don't exist yet.
 */
export function synthesizeMemberDefaults(seed: string, fullName: string) {
  const { pick, randInt } = makePickers(seed)

  const doe = new Date()
  doe.setFullYear(doe.getFullYear() - randInt(5, 20))
  doe.setMonth(randInt(0, 11))
  doe.setDate(randInt(1, 28))
  const djs = new Date(doe)
  djs.setMonth(djs.getMonth() + randInt(0, 3))

  const town = pick(KENYAN_TOWNS)
  const slug = fullName.trim().toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "")

  return {
    member_number: `TSC${randInt(10000000, 99999999)}`,
    personal_number: `${randInt(100000, 999999)}`,
    kra_pin: `A${randInt(100000000, 999999999)}${pick(["P", "Q", "R", "S", "T"])}`,
    employer_name: "Teachers Service Commission",
    date_of_employment: doe,
    date_joined_scheme: djs,
    town,
    postal_code: POSTAL_CODES[town] ?? "00100",
    postal_address: `P.O. Box ${randInt(100, 9999)}`,
    email: `${slug || "member"}@example.com`,
  }
}

/**
 * Finds (or creates) the Teachers Service Commission employer used as the
 * default for demo members.
 */
export async function getDefaultEmployer() {
  let employer = await prisma.employer.findFirst({
    where: { name: { contains: "Teachers Service Commission" } },
  })
  if (!employer) {
    employer = await prisma.employer.create({
      data: { name: "Teachers Service Commission", code: "TSC" },
    })
  }
  return employer
}

/**
 * Fills every null scalar field on a Member record with sensible random data.
 * Returns the up-to-date member. Idempotent.
 */
export async function ensureMemberProfile(member: Member): Promise<Member> {
  const defaults = synthesizeMemberDefaults(member.national_id, member.full_name)
  const patch: Record<string, unknown> = {}

  if (!member.member_number) patch.member_number = defaults.member_number
  if (!member.personal_number) patch.personal_number = defaults.personal_number
  if (!member.kra_pin) patch.kra_pin = defaults.kra_pin

  if (!member.employer_id || !member.employer_name) {
    const employer = await getDefaultEmployer()
    if (!member.employer_id) patch.employer_id = employer.id
    if (!member.employer_name) patch.employer_name = employer.name
  }

  if (!member.date_of_employment) patch.date_of_employment = defaults.date_of_employment
  if (!member.date_joined_scheme) patch.date_joined_scheme = defaults.date_joined_scheme
  if (!member.town) patch.town = defaults.town
  if (!member.postal_code) patch.postal_code = defaults.postal_code
  if (!member.postal_address) patch.postal_address = defaults.postal_address
  if (!member.email) patch.email = defaults.email

  if (!member.mobile_number) {
    const user = await prisma.user.findUnique({ where: { id: member.user_id }, select: { phone: true } })
    if (user?.phone) patch.mobile_number = user.phone
  }

  if (Object.keys(patch).length === 0) return member
  return prisma.member.update({ where: { id: member.id }, data: patch })
}

/**
 * Ensures the member has a contribution history (24 months). No-op if any
 * contributions already exist.
 */
export async function ensureContributions(memberId: string): Promise<void> {
  const existing = await prisma.contribution.count({ where: { member_id: memberId } })
  if (existing > 0) return

  const { randInt } = makePickers(memberId)
  const now = new Date()
  const rows = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const employee = randInt(5000, 15000)
    return {
      member_id: memberId,
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      employee_amount: employee,
      employer_amount: Math.round(employee * 1.5),
      date_received: new Date(d.getFullYear(), d.getMonth(), 15),
      status: "RECEIVED",
    }
  })
  await prisma.contribution.createMany({ data: rows })
}

/**
 * Ensures the member has a completed beneficiary nomination with beneficiaries
 * allocated to 100%. No-op if the member already has beneficiaries.
 */
export async function ensureBeneficiaries(memberId: string): Promise<void> {
  const existing = await prisma.beneficiary.count({ where: { member_id: memberId } })
  if (existing > 0) return

  const { pick, randInt } = makePickers(memberId)
  const reference = await generateCaseReference(CaseType.BENEFICIARY_NOMINATION)
  const spouseSurname = pick(SURNAMES)
  const minorBirth = new Date()
  minorBirth.setFullYear(minorBirth.getFullYear() - randInt(5, 16))

  const benCase = await prisma.case.create({
    data: {
      reference,
      type: CaseType.BENEFICIARY_NOMINATION,
      status: CaseStatus.COMPLETED,
      member_id: memberId,
      form_data: { has_minor_beneficiary: true, source: "demo_provision" },
      submitted_at: new Date(),
      completed_at: new Date(),
    },
  })

  await prisma.beneficiary.createMany({
    data: [
      {
        case_id: benCase.id,
        member_id: memberId,
        surname: spouseSurname,
        first_name: pick(FIRST_NAMES),
        relationship: "Spouse",
        national_id: `${randInt(10000000, 39999999)}`,
        mobile_number: `+2547${randInt(10000000, 99999999)}`,
        allocation_percent: 60,
        is_minor: false,
      },
      {
        case_id: benCase.id,
        member_id: memberId,
        surname: spouseSurname,
        first_name: pick(FIRST_NAMES),
        relationship: "Child",
        birth_cert_number: `${randInt(1000000, 9999999)}`,
        date_of_birth: minorBirth,
        allocation_percent: 40,
        is_minor: true,
        guardian_name: `${pick(FIRST_NAMES)} ${spouseSurname}`,
        guardian_relationship: "Mother",
        guardian_mobile: `+2547${randInt(10000000, 99999999)}`,
      },
    ],
  })
}

/**
 * Full demo-account guarantee: complete profile + contributions + beneficiaries.
 * Idempotent — safe to call on every login. Swallows errors so a provisioning
 * hiccup never blocks sign-in.
 */
export async function ensureMemberDemoData(memberId: string): Promise<void> {
  try {
    const member = await prisma.member.findUnique({ where: { id: memberId } })
    if (!member) return
    await ensureMemberProfile(member)
    await ensureContributions(memberId)
    await ensureBeneficiaries(memberId)
  } catch (err) {
    console.error("[provision] ensureMemberDemoData failed:", err)
  }
}

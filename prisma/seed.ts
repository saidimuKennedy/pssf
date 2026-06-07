import {
  Role,
  CaseType,
  CaseStatus,
  NotificationChannel,
  DocumentStatus,
  ApprovalType,
  ApprovalDecision,
} from "@prisma/client"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/db"

const HASH = (pw: string) => bcrypt.hashSync(pw, 10)

async function main() {
  // ── Employers ─────────────────────────────────────────────────────────────
  const employers = await Promise.all([
    prisma.employer.upsert({
      where: { code: "MOTI" },
      update: {},
      create: { id: "emp-0001-0000-0000-000000000001", name: "Ministry of Interior", code: "MOTI" },
    }),
    prisma.employer.upsert({
      where: { code: "MOF" },
      update: {},
      create: { id: "emp-0001-0000-0000-000000000002", name: "Ministry of Finance", code: "MOF" },
    }),
    prisma.employer.upsert({
      where: { code: "NTSA" },
      update: {},
      create: { id: "emp-0001-0000-0000-000000000003", name: "National Transport Safety Authority", code: "NTSA" },
    }),
    prisma.employer.upsert({
      where: { code: "KRA" },
      update: {},
      create: { id: "emp-0001-0000-0000-000000000004", name: "Kenya Revenue Authority", code: "KRA" },
    }),
  ])
  const [moti, mof, ntsa, kra] = employers
  console.log("✓ Employers seeded")

  // ── Employer users & officers ─────────────────────────────────────────────
  const employerUser1 = await prisma.user.upsert({
    where: { email: "hr@moti.go.ke" },
    update: {},
    create: {
      id: "usr-emp1-0000-0000-000000000001",
      email: "hr@moti.go.ke",
      password_hash: HASH("employer123"),
      role: Role.EMPLOYER,
    },
  })
  await prisma.employerOfficer.upsert({
    where: { user_id: employerUser1.id },
    update: {},
    create: {
      id: "off-0001-0000-0000-000000000001",
      user_id: employerUser1.id,
      employer_id: moti.id,
      full_name: "Grace Wangari",
      designation: "HR Manager",
    },
  })

  const employerUser2 = await prisma.user.upsert({
    where: { email: "hr@mof.go.ke" },
    update: {},
    create: {
      id: "usr-emp2-0000-0000-000000000002",
      email: "hr@mof.go.ke",
      password_hash: HASH("employer123"),
      role: Role.EMPLOYER,
    },
  })
  await prisma.employerOfficer.upsert({
    where: { user_id: employerUser2.id },
    update: {},
    create: {
      id: "off-0002-0000-0000-000000000002",
      user_id: employerUser2.id,
      employer_id: mof.id,
      full_name: "James Mugo",
      designation: "HR Director",
    },
  })
  console.log("✓ Employer officers seeded")

  // ── PSSF staff ────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "officer@pssf.go.ke" },
    update: {},
    create: {
      id: "usr-off1-0000-0000-000000000001",
      email: "officer@pssf.go.ke",
      password_hash: HASH("pssf1234"),
      role: Role.PSSF_OFFICER,
    },
  })
  await prisma.user.upsert({
    where: { email: "supervisor@pssf.go.ke" },
    update: {},
    create: {
      id: "usr-sup1-0000-0000-000000000001",
      email: "supervisor@pssf.go.ke",
      password_hash: HASH("pssf1234"),
      role: Role.PSSF_SUPERVISOR,
    },
  })
  await prisma.user.upsert({
    where: { email: "admin@pssf.go.ke" },
    update: {},
    create: {
      id: "usr-adm1-0000-0000-000000000001",
      email: "admin@pssf.go.ke",
      password_hash: HASH("pssf1234"),
      role: Role.ADMIN,
    },
  })
  console.log("✓ PSSF staff seeded")

  // ── Member users ──────────────────────────────────────────────────────────
  const memberUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "john.kamau@gmail.com" },
      update: {},
      create: {
        id: "usr-mem1-0000-0000-000000000001",
        email: "john.kamau@gmail.com",
        password_hash: HASH("member123"),
        role: Role.MEMBER,
      },
    }),
    prisma.user.upsert({
      where: { email: "mary.njeri@gmail.com" },
      update: {},
      create: {
        id: "usr-mem2-0000-0000-000000000002",
        email: "mary.njeri@gmail.com",
        password_hash: HASH("member123"),
        role: Role.MEMBER,
      },
    }),
    prisma.user.upsert({
      where: { email: "peter.odhiambo@gmail.com" },
      update: {},
      create: {
        id: "usr-mem3-0000-0000-000000000003",
        email: "peter.odhiambo@gmail.com",
        password_hash: HASH("member123"),
        role: Role.MEMBER,
      },
    }),
    prisma.user.upsert({
      where: { email: "fatuma.ali@gmail.com" },
      update: {},
      create: {
        id: "usr-mem4-0000-0000-000000000004",
        email: "fatuma.ali@gmail.com",
        password_hash: HASH("member123"),
        role: Role.MEMBER,
      },
    }),
    prisma.user.upsert({
      where: { email: "david.kipchoge@gmail.com" },
      update: {},
      create: {
        id: "usr-mem5-0000-0000-000000000005",
        email: "david.kipchoge@gmail.com",
        password_hash: HASH("member123"),
        role: Role.MEMBER,
      },
    }),
    // Unlinked member — validates by national_id/DOB but has no user account yet
    prisma.user.upsert({
      where: { email: "esther.wambui@gmail.com" },
      update: {},
      create: {
        id: "usr-mem6-0000-0000-000000000006",
        email: "esther.wambui@gmail.com",
        password_hash: HASH("member123"),
        role: Role.MEMBER,
      },
    }),
  ])
  const claimantUser = await prisma.user.upsert({
    where: { phone: "+254700000006" },
    update: {},
    create: {
      id: "usr-clm1-0000-0000-000000000001",
      phone: "+254700000006",
      password_hash: HASH("claimant123"),
      role: Role.CLAIMANT,
    },
  })
  console.log("✓ Member users seeded")

  // ── Members ───────────────────────────────────────────────────────────────
  const members = await Promise.all([
    prisma.member.upsert({
      where: { national_id: "12345678" },
      update: {},
      create: {
        id: "mem-0001-0000-0000-000000000001",
        user_id: memberUsers[0].id,
        national_id: "12345678",
        full_name: "John Kamau Njoroge",
        date_of_birth: new Date("1985-03-15"),
        kra_pin: "A123456789B",
        member_number: "PSSF/2010/001",
        personal_number: "PN001234",
        employer_id: moti.id,
        employer_name: moti.name,
        date_of_employment: new Date("2010-01-10"),
        date_joined_scheme: new Date("2010-02-01"),
        mobile_number: "+254712345678",
        email: "john.kamau@gmail.com",
        town: "Nairobi",
        communication_pref: NotificationChannel.PORTAL,
        is_verified: true,
      },
    }),
    prisma.member.upsert({
      where: { national_id: "23456789" },
      update: {},
      create: {
        id: "mem-0002-0000-0000-000000000002",
        user_id: memberUsers[1].id,
        national_id: "23456789",
        full_name: "Mary Njeri Wanjiku",
        date_of_birth: new Date("1990-07-22"),
        kra_pin: "B234567890C",
        member_number: "PSSF/2015/002",
        personal_number: "PN002345",
        employer_id: mof.id,
        employer_name: mof.name,
        date_of_employment: new Date("2015-03-01"),
        date_joined_scheme: new Date("2015-04-01"),
        mobile_number: "+254723456789",
        email: "mary.njeri@gmail.com",
        town: "Nairobi",
        communication_pref: NotificationChannel.PORTAL,
        is_verified: true,
      },
    }),
    prisma.member.upsert({
      where: { national_id: "34567890" },
      update: {},
      create: {
        id: "mem-0003-0000-0000-000000000003",
        user_id: memberUsers[2].id,
        national_id: "34567890",
        full_name: "Peter Odhiambo Otieno",
        date_of_birth: new Date("1988-11-30"),
        member_number: "PSSF/2012/003",
        employer_id: ntsa.id,
        employer_name: ntsa.name,
        date_of_employment: new Date("2012-06-15"),
        date_joined_scheme: new Date("2012-07-01"),
        mobile_number: "+254734567890",
        email: "peter.odhiambo@gmail.com",
        town: "Kisumu",
        communication_pref: NotificationChannel.PORTAL,
        is_verified: false,
      },
    }),
    prisma.member.upsert({
      where: { national_id: "45678901" },
      update: {},
      create: {
        id: "mem-0004-0000-0000-000000000004",
        user_id: memberUsers[3].id,
        national_id: "45678901",
        full_name: "Fatuma Ali Hassan",
        date_of_birth: new Date("1992-05-08"),
        member_number: "PSSF/2018/004",
        employer_id: kra.id,
        employer_name: kra.name,
        date_of_employment: new Date("2018-09-01"),
        date_joined_scheme: new Date("2018-10-01"),
        mobile_number: "+254745678901",
        email: "fatuma.ali@gmail.com",
        town: "Mombasa",
        communication_pref: NotificationChannel.EMAIL,
        is_verified: false,
      },
    }),
    prisma.member.upsert({
      where: { national_id: "56789012" },
      update: {},
      create: {
        id: "mem-0005-0000-0000-000000000005",
        user_id: memberUsers[4].id,
        national_id: "56789012",
        full_name: "David Kipchoge Rotich",
        date_of_birth: new Date("1987-01-19"),
        kra_pin: "D567890123E",
        member_number: "PSSF/2011/005",
        personal_number: "PN005678",
        employer_id: moti.id,
        employer_name: moti.name,
        date_of_employment: new Date("2011-04-01"),
        date_joined_scheme: new Date("2011-05-01"),
        mobile_number: "+254756789012",
        email: "david.kipchoge@gmail.com",
        town: "Eldoret",
        communication_pref: NotificationChannel.WHATSAPP,
        is_verified: true,
      },
    }),
    // Unlinked member for testing identity validation flow
    prisma.member.upsert({
      where: { national_id: "67890123" },
      update: {},
      create: {
        id: "mem-0006-0000-0000-000000000006",
        user_id: memberUsers[5].id,
        national_id: "67890123",
        full_name: "Esther Wambui Kariuki",
        date_of_birth: new Date("1995-08-14"),
        member_number: "PSSF/2020/006",
        employer_id: mof.id,
        employer_name: mof.name,
        date_of_employment: new Date("2020-01-06"),
        date_joined_scheme: new Date("2020-02-01"),
        mobile_number: "+254767890123",
        email: "esther.wambui@gmail.com",
        town: "Nairobi",
        communication_pref: NotificationChannel.PORTAL,
        is_verified: false,
      },
    }),
  ])
  console.log("✓ Members seeded")

  // Link member mobile numbers to user accounts (required for OTP login)
  for (const member of members) {
    if (member.user_id && member.mobile_number) {
      await prisma.user.update({
        where: { id: member.user_id },
        data: { phone: member.mobile_number },
      })
    }
  }
  console.log("✓ Member phone numbers linked for OTP login")

  // ── Cases ─────────────────────────────────────────────────────────────────
  // Case 1: Completed enrolment for John Kamau
  await prisma.case.upsert({
    where: { reference: "ENR-2024-000001" },
    update: {},
    create: {
      id: "case-001-0000-0000-000000000001",
      reference: "ENR-2024-000001",
      type: CaseType.MEMBER_ENROLMENT,
      status: CaseStatus.COMPLETED,
      member_id: members[0].id,
      employer_id: moti.id,
      form_data: {
        national_id: "12345678",
        date_of_birth: "1985-03-15",
        full_name: "John Kamau Njoroge",
        mobile_number: "+254712345678",
        email: "john.kamau@gmail.com",
        declaration_accepted: true,
      } as any,
    },
  })

  // Case 2: PENDING_EMPLOYER for Peter Odhiambo
  await prisma.case.upsert({
    where: { reference: "ENR-2025-000002" },
    update: {},
    create: {
      id: "case-002-0000-0000-000000000002",
      reference: "ENR-2025-000002",
      type: CaseType.MEMBER_ENROLMENT,
      status: CaseStatus.PENDING_EMPLOYER,
      member_id: members[2].id,
      employer_id: ntsa.id,
      form_data: {
        national_id: "34567890",
        date_of_birth: "1988-11-30",
        full_name: "Peter Odhiambo Otieno",
        mobile_number: "+254734567890",
        declaration_accepted: true,
      } as any,
    },
  })

  // Case 3: UNDER_REVIEW for Fatuma Ali
  await prisma.case.upsert({
    where: { reference: "ENR-2025-000003" },
    update: {},
    create: {
      id: "case-003-0000-0000-000000000003",
      reference: "ENR-2025-000003",
      type: CaseType.MEMBER_ENROLMENT,
      status: CaseStatus.UNDER_REVIEW,
      member_id: members[3].id,
      employer_id: kra.id,
      form_data: {
        national_id: "45678901",
        date_of_birth: "1992-05-08",
        full_name: "Fatuma Ali Hassan",
        mobile_number: "+254745678901",
        email: "fatuma.ali@gmail.com",
        declaration_accepted: true,
      } as any,
    },
  })

  // Case 4: DRAFT for Esther Wambui
  await prisma.case.upsert({
    where: { reference: "ENR-2026-000004" },
    update: {},
    create: {
      id: "case-004-0000-0000-000000000004",
      reference: "ENR-2026-000004",
      type: CaseType.MEMBER_ENROLMENT,
      status: CaseStatus.DRAFT,
      member_id: members[5].id,
      employer_id: mof.id,
      form_data: {
        national_id: "67890123",
        date_of_birth: "1995-08-14",
      } as any,
    },
  })

  // Case 5: REJECTED benefits claim for Mary Njeri
  await prisma.case.upsert({
    where: { reference: "CLM-2025-000001" },
    update: {},
    create: {
      id: "case-005-0000-0000-000000000005",
      reference: "CLM-2025-000001",
      type: CaseType.BENEFITS_CLAIM,
      status: CaseStatus.REJECTED,
      member_id: members[1].id,
      form_data: {
        benefit_option: "LUMP_SUM",
        declaration_accepted: true,
      } as any,
    },
  })

  const pssfOfficer = await prisma.user.findUnique({ where: { email: "officer@pssf.go.ke" } })

  // J3 Case 1: DRAFT beneficiary nomination — John Kamau
  await prisma.case.upsert({
    where: { reference: "BEN-2024-000001" },
    update: {},
    create: {
      id: "case-ben1-0000-0000-000000000001",
      reference: "BEN-2024-000001",
      type: CaseType.BENEFICIARY_NOMINATION,
      status: CaseStatus.DRAFT,
      member_id: members[0].id,
      employer_id: moti.id,
      form_data: {
        national_id: "12345678",
        full_name: "John Kamau Njoroge",
        mobile_number: "+254712345678",
        has_minor_beneficiary: false,
      } as any,
    },
  })

  // J3 Case 2: UNDER_REVIEW — Mary Njeri (with minor beneficiaries)
  await prisma.case.upsert({
    where: { reference: "BEN-2024-000002" },
    update: {},
    create: {
      id: "case-ben2-0000-0000-000000000002",
      reference: "BEN-2024-000002",
      type: CaseType.BENEFICIARY_NOMINATION,
      status: CaseStatus.UNDER_REVIEW,
      member_id: members[1].id,
      employer_id: mof.id,
      submitted_at: new Date("2024-06-01"),
      form_data: {
        national_id: "23456789",
        full_name: "Mary Njeri Wanjiku",
        mobile_number: "+254723456789",
        has_minor_beneficiary: true,
        guardian_name: "Esther Achieng",
        guardian_relationship: "Grandmother",
        guardian_address: "P.O. Box 456, Nairobi",
        guardian_postal_code: "00100",
        guardian_town: "Nairobi",
        guardian_mobile: "+254723456789",
        minor_benefit_option: "GUARDIAN",
        witnessed_by: "James Mwangi",
        witness_id_number: "11223344",
        witness_mobile: "+254723456789",
        witness_date: "2024-05-28",
        declaration_accepted: true,
      } as any,
    },
  })

  // J3 Case 3: MORE_INFO_REQUIRED — Peter Odhiambo
  await prisma.case.upsert({
    where: { reference: "BEN-2024-000003" },
    update: {},
    create: {
      id: "case-ben3-0000-0000-000000000003",
      reference: "BEN-2024-000003",
      type: CaseType.BENEFICIARY_NOMINATION,
      status: CaseStatus.MORE_INFO_REQUIRED,
      member_id: members[2].id,
      employer_id: ntsa.id,
      submitted_at: new Date("2024-07-10"),
      form_data: {
        national_id: "34567890",
        full_name: "Peter Odhiambo Otieno",
        mobile_number: "+254734567890",
        has_minor_beneficiary: false,
        info_requested: "Please provide complete witness details including witness mobile number.",
        declaration_accepted: true,
      } as any,
    },
  })

  // J3 Case 4: COMPLETED — Fatuma Ali
  await prisma.case.upsert({
    where: { reference: "BEN-2024-000004" },
    update: {},
    create: {
      id: "case-ben4-0000-0000-000000000004",
      reference: "BEN-2024-000004",
      type: CaseType.BENEFICIARY_NOMINATION,
      status: CaseStatus.COMPLETED,
      member_id: members[3].id,
      employer_id: kra.id,
      submitted_at: new Date("2024-03-15"),
      completed_at: new Date("2024-04-01"),
      form_data: {
        national_id: "45678901",
        full_name: "Fatuma Ali Hassan",
        mobile_number: "+254745678901",
        has_minor_beneficiary: false,
        declaration_accepted: true,
      } as any,
    },
  })

  console.log("✓ Cases seeded")

  // ── Beneficiaries (J3) ────────────────────────────────────────────────────
  const benDraft = await prisma.case.findUnique({ where: { reference: "BEN-2024-000001" } })
  const benReview = await prisma.case.findUnique({ where: { reference: "BEN-2024-000002" } })
  const benMoreInfo = await prisma.case.findUnique({ where: { reference: "BEN-2024-000003" } })
  const benCompleted = await prisma.case.findUnique({ where: { reference: "BEN-2024-000004" } })

  if (benDraft) {
    await prisma.beneficiary.deleteMany({ where: { case_id: benDraft.id } })
    await prisma.beneficiary.createMany({
      data: [
        {
          case_id: benDraft.id,
          surname: "Kamau",
          first_name: "James",
          relationship: "Child",
          national_id: "99887766",
          date_of_birth: new Date("2005-01-15"),
          allocation_percent: 40,
          is_minor: false,
        },
        {
          case_id: benDraft.id,
          surname: "Kamau",
          first_name: "Grace",
          relationship: "Spouse",
          national_id: "88776655",
          date_of_birth: new Date("1987-08-20"),
          allocation_percent: 60,
          is_minor: false,
        },
      ],
    })
  }

  if (benReview) {
    await prisma.beneficiary.deleteMany({ where: { case_id: benReview.id } })
    await prisma.beneficiary.createMany({
      data: [
        {
          case_id: benReview.id,
          surname: "Ouma",
          first_name: "Peter",
          relationship: "Child",
          birth_cert_number: "BC-2015-00123",
          date_of_birth: new Date("2015-03-10"),
          allocation_percent: 50,
          is_minor: true,
          guardian_name: "Esther Achieng",
          guardian_relationship: "Grandmother",
          guardian_address: "P.O. Box 456, Nairobi",
          guardian_mobile: "+254723456789",
        },
        {
          case_id: benReview.id,
          surname: "Ouma",
          first_name: "Jane",
          relationship: "Child",
          birth_cert_number: "BC-2018-00456",
          date_of_birth: new Date("2018-07-22"),
          allocation_percent: 30,
          is_minor: true,
          guardian_name: "Esther Achieng",
          guardian_relationship: "Grandmother",
          guardian_address: "P.O. Box 456, Nairobi",
          guardian_mobile: "+254723456789",
        },
        {
          case_id: benReview.id,
          surname: "Achieng",
          first_name: "Thomas",
          relationship: "Parent",
          national_id: "77665544",
          date_of_birth: new Date("1960-11-05"),
          allocation_percent: 20,
          is_minor: false,
        },
      ],
    })
  }

  if (benMoreInfo) {
    await prisma.beneficiary.deleteMany({ where: { case_id: benMoreInfo.id } })
    await prisma.beneficiary.create({
      data: {
        case_id: benMoreInfo.id,
        surname: "Otieno",
        first_name: "Lucy",
        relationship: "Spouse",
        national_id: "66554433",
        date_of_birth: new Date("1990-04-12"),
        allocation_percent: 100,
        is_minor: false,
      },
    })
  }

  if (benCompleted) {
    await prisma.beneficiary.deleteMany({ where: { case_id: benCompleted.id } })
    await prisma.beneficiary.createMany({
      data: [
        {
          case_id: benCompleted.id,
          surname: "Hassan",
          first_name: "Ahmed",
          relationship: "Child",
          national_id: "55443322",
          date_of_birth: new Date("2000-09-01"),
          allocation_percent: 50,
          is_minor: false,
        },
        {
          case_id: benCompleted.id,
          surname: "Hassan",
          first_name: "Amina",
          relationship: "Spouse",
          national_id: "44332211",
          date_of_birth: new Date("1994-12-18"),
          allocation_percent: 50,
          is_minor: false,
        },
      ],
    })
  }
  console.log("✓ Beneficiaries seeded")

  // ── J3 Documents ──────────────────────────────────────────────────────────
  const placeholderPdf = Buffer.from("%PDF-1.4 placeholder")
  if (benReview) {
    await prisma.document.deleteMany({ where: { case_id: benReview.id } })
    await prisma.document.createMany({
      data: [
        {
          case_id: benReview.id,
          document_type: "NATIONAL_ID",
          status: DocumentStatus.VERIFIED,
          file_name: "national_id.pdf",
          file_data: placeholderPdf,
          mime_type: "application/pdf",
          file_size_kb: 1,
          uploaded_at: new Date("2024-06-01"),
        },
        {
          case_id: benReview.id,
          document_type: "BIRTH_CERTIFICATE",
          status: DocumentStatus.VERIFIED,
          file_name: "birth_cert.pdf",
          file_data: placeholderPdf,
          mime_type: "application/pdf",
          file_size_kb: 1,
          uploaded_at: new Date("2024-06-01"),
        },
      ],
    })
  }

  if (benMoreInfo && pssfOfficer) {
    await prisma.approval.deleteMany({ where: { case_id: benMoreInfo.id } })
    await prisma.approval.create({
      data: {
        case_id: benMoreInfo.id,
        type: ApprovalType.PSSF,
        decision: ApprovalDecision.REQUEST_MORE_INFO,
        actor_id: pssfOfficer.id,
        actor_name: "David Mutua",
        actor_role: "PSSF_OFFICER",
        reason: "Witness mobile number is missing.",
        comments: "Please provide complete witness details.",
      },
    })
  }
  console.log("✓ J3 documents and approvals seeded")

  // J4 Case 1: DRAFT NEW/PAYROLL — John Kamau
  await prisma.case.upsert({
    where: { reference: "AVC-2024-000001" },
    update: {},
    create: {
      id: "case-avc1-0000-0000-000000000001",
      reference: "AVC-2024-000001",
      type: CaseType.AVC,
      status: CaseStatus.DRAFT,
      member_id: members[0].id,
      employer_id: moti.id,
      form_data: {
        national_id: "12345678",
        full_name: "John Kamau Njoroge",
        mobile_number: "+254712345678",
        avc_action: "NEW",
        avc_method: "PAYROLL",
        new_amount: 5000,
        commencement_date: "2024-08-01",
      } as any,
    },
  })

  // J4 Case 2: PENDING_EMPLOYER NEW/PAYROLL — Mary Njeri
  await prisma.case.upsert({
    where: { reference: "AVC-2024-000002" },
    update: {},
    create: {
      id: "case-avc2-0000-0000-000000000002",
      reference: "AVC-2024-000002",
      type: CaseType.AVC,
      status: CaseStatus.PENDING_EMPLOYER,
      member_id: members[1].id,
      employer_id: mof.id,
      submitted_at: new Date("2024-07-15"),
      form_data: {
        national_id: "23456789",
        full_name: "Mary Njeri Wanjiku",
        mobile_number: "+254723456789",
        avc_action: "NEW",
        avc_method: "PAYROLL",
        new_amount: 3000,
        commencement_date: "2024-09-01",
        declaration_accepted: true,
      } as any,
    },
  })

  // J4 Case 3: COMPLETED VARY/PAYROLL — Peter Odhiambo
  await prisma.case.upsert({
    where: { reference: "AVC-2024-000003" },
    update: {},
    create: {
      id: "case-avc3-0000-0000-000000000003",
      reference: "AVC-2024-000003",
      type: CaseType.AVC,
      status: CaseStatus.COMPLETED,
      member_id: members[2].id,
      employer_id: ntsa.id,
      submitted_at: new Date("2024-05-01"),
      completed_at: new Date("2024-06-01"),
      form_data: {
        national_id: "34567890",
        full_name: "Peter Odhiambo Otieno",
        mobile_number: "+254734567890",
        avc_action: "VARY",
        avc_method: "PAYROLL",
        current_amount: 4000,
        new_amount: 6000,
        effective_date: "2024-06-01",
        declaration_accepted: true,
      } as any,
    },
  })

  // J4 Case 4: COMPLETED CANCEL/PAYROLL — Fatuma Ali
  await prisma.case.upsert({
    where: { reference: "AVC-2024-000004" },
    update: {},
    create: {
      id: "case-avc4-0000-0000-000000000004",
      reference: "AVC-2024-000004",
      type: CaseType.AVC,
      status: CaseStatus.COMPLETED,
      member_id: members[3].id,
      employer_id: kra.id,
      submitted_at: new Date("2024-04-01"),
      completed_at: new Date("2024-05-01"),
      form_data: {
        national_id: "45678901",
        full_name: "Fatuma Ali Hassan",
        mobile_number: "+254745678901",
        avc_action: "CANCEL",
        avc_method: "PAYROLL",
        current_amount: 2500,
        effective_date: "2024-05-01",
        declaration_accepted: true,
      } as any,
    },
  })

  const avcVary = await prisma.case.findUnique({ where: { reference: "AVC-2024-000003" } })
  const avcCancel = await prisma.case.findUnique({ where: { reference: "AVC-2024-000004" } })

  if (avcVary && employerUser1) {
    await prisma.approval.deleteMany({ where: { case_id: avcVary.id } })
    await prisma.approval.create({
      data: {
        case_id: avcVary.id,
        type: ApprovalType.EMPLOYER,
        decision: ApprovalDecision.APPROVED,
        actor_id: employerUser1.id,
        actor_name: "Grace Wangari",
        actor_role: "EMPLOYER",
        actor_org: moti.name,
        digital_ref: "2024-06",
        comments: JSON.stringify({
          officer_name: "Grace Wangari",
          designation: "HR Manager",
          effective_payroll_month: "2024-06",
        }),
      },
    })
    if (pssfOfficer) {
      await prisma.approval.create({
        data: {
          case_id: avcVary.id,
          type: ApprovalType.PSSF,
          decision: ApprovalDecision.APPROVED,
          actor_id: pssfOfficer.id,
          actor_name: "David Mutua",
          actor_role: "PSSF_OFFICER",
          comments: "AVC variation recorded.",
        },
      })
    }
  }

  if (avcCancel && employerUser1) {
    await prisma.approval.deleteMany({ where: { case_id: avcCancel.id } })
    await prisma.approval.create({
      data: {
        case_id: avcCancel.id,
        type: ApprovalType.EMPLOYER,
        decision: ApprovalDecision.APPROVED,
        actor_id: employerUser1.id,
        actor_name: "Grace Wangari",
        actor_role: "EMPLOYER",
        digital_ref: "2024-05",
        comments: JSON.stringify({
          officer_name: "Grace Wangari",
          designation: "HR Manager",
          effective_payroll_month: "2024-05",
        }),
      },
    })
    if (pssfOfficer) {
      await prisma.approval.create({
        data: {
          case_id: avcCancel.id,
          type: ApprovalType.PSSF,
          decision: ApprovalDecision.APPROVED,
          actor_id: pssfOfficer.id,
          actor_name: "David Mutua",
          actor_role: "PSSF_OFFICER",
          comments: "AVC cancellation recorded.",
        },
      })
    }
  }
  console.log("✓ J4 AVC cases seeded")

  // ── Contributions (24 months × 5 members) ───────────────────────────────
  const contributionRates: [string, number, number][] = [
    [members[0].id, 37500, 37500],
    [members[1].id, 28000, 28000],
    [members[2].id, 42000, 42000],
    [members[3].id, 55000, 55000],
    [members[4].id, 31000, 31000],
  ]
  const now = new Date()
  for (const [memberId, empAmt, erAmt] of contributionRates) {
    await prisma.contribution.deleteMany({ where: { member_id: memberId } })
    const rows = []
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 15)
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      rows.push({
        member_id: memberId,
        month,
        employee_amount: empAmt,
        employer_amount: erAmt,
        date_received: d,
        status: "RECEIVED",
      })
    }
    await prisma.contribution.createMany({ data: rows })
  }
  console.log("✓ Contributions seeded")

  const benefitsForm = (member: (typeof members)[0], extra: Record<string, unknown> = {}) => ({
    national_id: member.national_id,
    full_name: member.full_name,
    bank_account_number: "0123456789",
    bank_name: "KCB Bank",
    bank_branch: "Nairobi",
    mpesa_number: member.mobile_number,
    date_of_leaving: "2024-05-15",
    reason_for_leaving: "NORMAL_RETIREMENT",
    benefit_option: "FULL_ANNUITY",
    payment_confirmed: true,
    preview_payment_confirmed: true,
    declaration_accepted: true,
    ...extra,
  })

  // J5 Benefits Claim cases
  const j5Cases = [
    { ref: "CLM-2024-000001", id: "case-clm1-0000-0000-000000000001", member: members[4], status: CaseStatus.SUBMITTED, employer: moti, submitted: new Date("2024-08-01") },
    { ref: "CLM-2024-000002", id: "case-clm2-0000-0000-000000000002", member: members[2], status: CaseStatus.PENDING_EMPLOYER, employer: ntsa, submitted: new Date("2024-07-20") },
    { ref: "CLM-2024-000003", id: "case-clm3-0000-0000-000000000003", member: members[1], status: CaseStatus.UNDER_REVIEW, employer: mof, submitted: new Date("2024-07-10") },
    { ref: "CLM-2024-000004", id: "case-clm4-0000-0000-000000000004", member: members[3], status: CaseStatus.UNDER_VERIFICATION, employer: kra, submitted: new Date("2024-06-25") },
    { ref: "CLM-2024-000005", id: "case-clm5-0000-0000-000000000005", member: members[0], status: CaseStatus.APPROVED, employer: moti, submitted: new Date("2024-06-01") },
    { ref: "CLM-2024-000006", id: "case-clm6-0000-0000-000000000006", member: members[4], status: CaseStatus.PAYMENT_PROCESSING, employer: moti, submitted: new Date("2024-05-15") },
  ]

  for (const c of j5Cases) {
    await prisma.case.upsert({
      where: { reference: c.ref },
      update: {},
      create: {
        id: c.id,
        reference: c.ref,
        type: CaseType.BENEFITS_CLAIM,
        status: c.status,
        member_id: c.member.id,
        employer_id: c.employer.id,
        submitted_at: c.submitted,
        form_data: benefitsForm(c.member) as any,
      },
    })
  }
  console.log("✓ J5 benefits claim cases seeded")

  const deathForm = {
    deceased_member_id: members[0].id,
    full_name: members[0].full_name,
    national_id: members[0].national_id,
    date_of_death: "2024-07-01",
    county: "Nairobi",
    subcounty: "Westlands",
    location: "Parklands",
    sublocation: "Highridge",
    village: "Kitisuru",
    chief_name: "Chief Mwangi",
    benefit_option: "FULL_LUMPSUM",
    claimants: [
      {
        name: "Sarah Kamau",
        relationship: "Spouse",
        national_id: "11223344",
        mobile_number: "+254700000006",
        is_minor: false,
        bank_account_number: "9876543210",
        bank_name: "Equity Bank",
        bank_branch: "Westlands",
      },
    ],
    has_spouse_claimant: true,
    has_child_claimant: false,
    has_minor_claimant: false,
    witness_name: "James Otieno",
    witness_id: "99887766",
    witness_signature: "James Otieno",
    witness_date: "2024-07-05",
    declaration_accepted: true,
    claimant_user_id: claimantUser.id,
  }

  const j6Cases = [
    { ref: "DCL-2024-000001", id: "case-dcl1-0000-0000-000000000001", status: CaseStatus.SUBMITTED, submitted: new Date("2024-08-05") },
    { ref: "DCL-2024-000002", id: "case-dcl2-0000-0000-000000000002", status: CaseStatus.UNDER_VERIFICATION, submitted: new Date("2024-07-15") },
    { ref: "DCL-2024-000003", id: "case-dcl3-0000-0000-000000000003", status: CaseStatus.AWAITING_TRUSTEE, submitted: new Date("2024-06-20") },
  ]

  for (const c of j6Cases) {
    await prisma.case.upsert({
      where: { reference: c.ref },
      update: {},
      create: {
        id: c.id,
        reference: c.ref,
        type: CaseType.DEATH_BENEFITS_CLAIM,
        status: c.status,
        member_id: members[0].id,
        employer_id: moti.id,
        claimant_name: "Sarah Kamau",
        submitted_at: c.submitted,
        form_data: deathForm as any,
      },
    })
  }
  console.log("✓ J6 death benefits cases seeded")

  const clm4 = await prisma.case.findUnique({ where: { reference: "CLM-2024-000004" } })
  const dcl2 = await prisma.case.findUnique({ where: { reference: "DCL-2024-000002" } })

  if (clm4) {
    await prisma.document.deleteMany({ where: { case_id: clm4.id } })
    await prisma.document.createMany({
      data: [
        { case_id: clm4.id, document_type: "EXIT_LETTER", status: DocumentStatus.VERIFIED, file_name: "exit.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: clm4.id, document_type: "NATIONAL_ID", status: DocumentStatus.VERIFIED, file_name: "id.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: clm4.id, document_type: "ATM_CARD", status: DocumentStatus.UNDER_REVIEW, file_name: "atm.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: clm4.id, document_type: "KRA_PIN", status: DocumentStatus.VERIFIED, file_name: "kra.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
      ],
    })
  }

  if (dcl2) {
    await prisma.document.deleteMany({ where: { case_id: dcl2.id } })
    await prisma.document.createMany({
      data: [
        { case_id: dcl2.id, document_type: "DEATH_CERTIFICATE", status: DocumentStatus.VERIFIED, file_name: "death.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: dcl2.id, document_type: "MARRIAGE_CERTIFICATE", status: DocumentStatus.VERIFIED, file_name: "marriage.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: dcl2.id, document_type: "NATIONAL_ID", status: DocumentStatus.VERIFIED, file_name: "claimant_id.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: dcl2.id, document_type: "ATM_CARD", status: DocumentStatus.UNDER_REVIEW, file_name: "atm.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
      ],
    })
  }

  const clm3 = await prisma.case.findUnique({ where: { reference: "CLM-2024-000003" } })
  const clm4Case = await prisma.case.findUnique({ where: { reference: "CLM-2024-000004" } })

  if (clm3 && employerUser2) {
    await prisma.approval.deleteMany({ where: { case_id: clm3.id } })
    await prisma.approval.create({
      data: {
        case_id: clm3.id,
        type: ApprovalType.EMPLOYER,
        decision: ApprovalDecision.APPROVED,
        actor_id: employerUser2.id,
        actor_name: "James Mugo",
        actor_role: "EMPLOYER",
        actor_org: mof.name,
      },
    })
  }

  if (clm4Case && employerUser1 && pssfOfficer) {
    await prisma.approval.deleteMany({ where: { case_id: clm4Case.id } })
    await prisma.approval.createMany({
      data: [
        {
          case_id: clm4Case.id,
          type: ApprovalType.EMPLOYER,
          decision: ApprovalDecision.APPROVED,
          actor_id: employerUser1.id,
          actor_name: "Grace Wangari",
          actor_role: "EMPLOYER",
          actor_org: moti.name,
        },
        {
          case_id: clm4Case.id,
          type: ApprovalType.PSSF,
          decision: ApprovalDecision.APPROVED,
          actor_id: pssfOfficer.id,
          actor_name: "David Mutua",
          actor_role: "PSSF_OFFICER",
        },
      ],
    })
  }
  console.log("✓ J5/J6 documents and approvals seeded")

  // E1 Missing Contribution cases
  await prisma.case.upsert({
    where: { reference: "MCR-2024-000001" },
    update: {},
    create: {
      id: "case-mcr1-0000-0000-000000000001",
      reference: "MCR-2024-000001",
      type: CaseType.MISSING_CONTRIBUTION,
      status: CaseStatus.UNDER_REVIEW,
      member_id: members[1].id,
      employer_id: mof.id,
      submitted_at: new Date("2024-07-01"),
      form_data: {
        month: "2024-05",
        contribution_type: "BOTH",
        explanation: "May 2024 contributions not reflected on my statement.",
        employer_name: mof.name,
      } as any,
    },
  })

  await prisma.case.upsert({
    where: { reference: "MCR-2024-000002" },
    update: {},
    create: {
      id: "case-mcr2-0000-0000-000000000002",
      reference: "MCR-2024-000002",
      type: CaseType.MISSING_CONTRIBUTION,
      status: CaseStatus.COMPLETED,
      member_id: members[2].id,
      employer_id: ntsa.id,
      submitted_at: new Date("2024-05-01"),
      completed_at: new Date("2024-06-01"),
      form_data: {
        month: "2024-03",
        contribution_type: "EMPLOYEE",
        explanation: "Employee contribution for March missing.",
        employer_name: ntsa.name,
        resolution_notes: "Contribution located and credited.",
      } as any,
    },
  })

  // E2 Discrepancy cases
  await prisma.case.upsert({
    where: { reference: "DIS-2024-000001" },
    update: {},
    create: {
      id: "case-dis1-0000-0000-000000000001",
      reference: "DIS-2024-000001",
      type: CaseType.DISCREPANCY,
      status: CaseStatus.UNDER_REVIEW,
      member_id: members[0].id,
      employer_id: moti.id,
      submitted_at: new Date("2024-06-15"),
      form_data: {
        field_name: "NAME",
        field_category: "IDENTITY",
        correct_information: "John Kamau Mwangi",
        explanation: "Name spelling on record is incorrect.",
      } as any,
    },
  })

  await prisma.case.upsert({
    where: { reference: "DIS-2024-000002" },
    update: {},
    create: {
      id: "case-dis2-0000-0000-000000000002",
      reference: "DIS-2024-000002",
      type: CaseType.DISCREPANCY,
      status: CaseStatus.COMPLETED,
      member_id: members[3].id,
      employer_id: kra.id,
      submitted_at: new Date("2024-04-01"),
      completed_at: new Date("2024-05-01"),
      form_data: {
        field_name: "DATE_OF_BIRTH",
        field_category: "IDENTITY",
        correct_information: "1992-05-08",
        explanation: "Date of birth on record is wrong.",
        resolution_notes: "Record updated after verification.",
      } as any,
    },
  })
  console.log("✓ E1/E2 cases seeded")

  // ── Kennedy Test Credentials ──────────────────────────────────────────────
  // Member  : phone +254704696287  → WhatsApp OTP + case notifications via portal/WhatsApp
  //           email is intentionally null so OTP email delivery isn't blocked by Resend sender limits
  // Staff   : waruirukennedy2@gmail.com / Kennedy@1234  (PSSF_OFFICER) — OTP delivered to real inbox
  // Employer: kennedy.employer@pssf.go.ke / Kennedy@1234  (can approve Kennedy's cases)
  // Admin   : kennedy.admin@pssf.go.ke    / Kennedy@1234

  const kennedyEmployer = await prisma.employer.upsert({
    where: { code: "KTEST" },
    update: {},
    create: { id: "emp-ken1-0000-0000-000000000001", name: "Kenya Test Ministry", code: "KTEST" },
  })

  const kennedyEmployerUser = await prisma.user.upsert({
    where: { email: "kennedy.employer@pssf.go.ke" },
    update: {},
    create: {
      id: "usr-kenEmp-000-0000-000000000001",
      email: "kennedy.employer@pssf.go.ke",
      password_hash: HASH("Kennedy@1234"),
      role: Role.EMPLOYER,
      is_active: true,
    },
  })
  await prisma.employerOfficer.upsert({
    where: { user_id: kennedyEmployerUser.id },
    update: {},
    create: {
      id: "off-ken1-0000-0000-000000000001",
      user_id: kennedyEmployerUser.id,
      employer_id: kennedyEmployer.id,
      full_name: "Kennedy Waruiru",
      designation: "HR Director",
    },
  })

  // Officer login email is waruirukennedy2@gmail.com so OTP is deliverable via Resend test sender.
  // Upsert by id (not email) so the where clause works regardless of prior email value.
  await prisma.user.upsert({
    where: { id: "usr-kenOff-000-0000-000000000001" },
    update: { email: "waruirukennedy2@gmail.com", password_hash: HASH("Kennedy@1234"), is_active: true },
    create: {
      id: "usr-kenOff-000-0000-000000000001",
      email: "waruirukennedy2@gmail.com",
      password_hash: HASH("Kennedy@1234"),
      role: Role.PSSF_OFFICER,
      is_active: true,
    },
  })

  await prisma.user.upsert({
    where: { email: "kennedy.admin@pssf.go.ke" },
    update: {},
    create: {
      id: "usr-kenAdm-000-0000-000000000001",
      email: "kennedy.admin@pssf.go.ke",
      password_hash: HASH("Kennedy@1234"),
      role: Role.ADMIN,
      is_active: true,
    },
  })

  const kennedyMemberUser = await prisma.user.upsert({
    where: { phone: "+254704696287" },
    update: { email: null, is_active: true },
    create: {
      id: "usr-kenMem-000-0000-000000000001",
      phone: "+254704696287",
      email: null,
      role: Role.MEMBER,
      is_active: true,
    },
  })

  const kennedyMember = await prisma.member.upsert({
    where: { national_id: "70469628" },
    update: {},
    create: {
      id: "mem-ken1-0000-0000-000000000001",
      user_id: kennedyMemberUser.id,
      national_id: "70469628",
      full_name: "Kennedy Waruiru",
      date_of_birth: new Date("1990-06-26"),
      kra_pin: "K704969628W",
      member_number: "PSSF/2015/099",
      personal_number: "PN099696",
      employer_id: kennedyEmployer.id,
      employer_name: kennedyEmployer.name,
      date_of_employment: new Date("2015-01-05"),
      date_joined_scheme: new Date("2015-02-01"),
      mobile_number: "+254704696287",
      email: "waruirukennedy2@gmail.com",
      town: "Nairobi",
      communication_pref: NotificationChannel.WHATSAPP,
      is_verified: true,
    },
  })

  // 24 months contributions for Kennedy
  await prisma.contribution.deleteMany({ where: { member_id: kennedyMember.id } })
  const kennedyContribs = []
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 15)
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    kennedyContribs.push({
      member_id: kennedyMember.id,
      month,
      employee_amount: 45000,
      employer_amount: 45000,
      date_received: d,
      status: "RECEIVED",
    })
  }
  await prisma.contribution.createMany({ data: kennedyContribs })
  console.log("✓ Kennedy member + contributions seeded")

  // ── J2 Member Enrolment ───────────────────────────────────────────────────
  // ENR-TEST-1: PENDING_EMPLOYER  → login as kennedy.employer → Approve  → fires EMPLOYER_APPROVED  WA+email
  // ENR-TEST-2: PENDING_EMPLOYER  → login as kennedy.employer → Reject   → fires EMPLOYER_REJECTED  WA+email
  // ENR-TEST-3: UNDER_REVIEW      → login as kennedy.officer  → Approve  → fires CASE_APPROVED      WA+email
  // ENR-TEST-4: UNDER_REVIEW      → login as kennedy.officer  → Request more info → MORE_INFO_REQUIRED WA+email
  // ENR-TEST-5: MORE_INFO_REQUIRED (already fired, visible in portal)

  for (const [ref, id, status, extra] of [
    ["ENR-TEST-000001", "case-kenEnr1-0000-0000-00000001", CaseStatus.PENDING_EMPLOYER, {}],
    ["ENR-TEST-000002", "case-kenEnr2-0000-0000-00000002", CaseStatus.PENDING_EMPLOYER, {}],
    ["ENR-TEST-000003", "case-kenEnr3-0000-0000-00000003", CaseStatus.UNDER_REVIEW, {}],
    ["ENR-TEST-000004", "case-kenEnr4-0000-0000-00000004", CaseStatus.UNDER_REVIEW, {}],
    ["ENR-TEST-000005", "case-kenEnr5-0000-0000-00000005", CaseStatus.MORE_INFO_REQUIRED, { info_requested: "Please upload a certified copy of your National ID." }],
  ] as const) {
    await prisma.case.upsert({
      where: { reference: ref },
      update: {},
      create: {
        id,
        reference: ref,
        type: CaseType.MEMBER_ENROLMENT,
        status,
        member_id: kennedyMember.id,
        employer_id: kennedyEmployer.id,
        submitted_at: new Date(),
        form_data: {
          national_id: "70469628",
          date_of_birth: "1990-06-26",
          full_name: "Kennedy Waruiru",
          mobile_number: "+254704696287",
          email: "waruirukennedy2@gmail.com",
          declaration_accepted: true,
          ...extra,
        } as any,
      },
    })
  }
  console.log("✓ J2 Kennedy enrolment cases seeded")

  // ── J3 Beneficiary Nomination ─────────────────────────────────────────────
  // BEN-TEST-1: UNDER_REVIEW → PSSF approve  → CASE_APPROVED WA+email
  // BEN-TEST-2: UNDER_REVIEW → PSSF reject   → CASE_REJECTED WA+email
  // BEN-TEST-3: MORE_INFO_REQUIRED (visible, already fired)
  // BEN-TEST-4: COMPLETED    (historical view)

  for (const [ref, id, status, extra] of [
    ["BEN-TEST-000001", "case-kenBen1-0000-0000-00000001", CaseStatus.UNDER_REVIEW, {}],
    ["BEN-TEST-000002", "case-kenBen2-0000-0000-00000002", CaseStatus.UNDER_REVIEW, {}],
    ["BEN-TEST-000003", "case-kenBen3-0000-0000-00000003", CaseStatus.MORE_INFO_REQUIRED, { info_requested: "Please provide witness ID number." }],
    ["BEN-TEST-000004", "case-kenBen4-0000-0000-00000004", CaseStatus.COMPLETED, {}],
  ] as const) {
    await prisma.case.upsert({
      where: { reference: ref },
      update: {},
      create: {
        id,
        reference: ref,
        type: CaseType.BENEFICIARY_NOMINATION,
        status,
        member_id: kennedyMember.id,
        employer_id: kennedyEmployer.id,
        submitted_at: new Date("2026-01-15"),
        ...(status === CaseStatus.COMPLETED ? { completed_at: new Date("2026-02-01") } : {}),
        form_data: {
          national_id: "70469628",
          full_name: "Kennedy Waruiru",
          mobile_number: "+254704696287",
          has_minor_beneficiary: false,
          declaration_accepted: true,
          ...extra,
        } as any,
      },
    })
  }

  // Beneficiaries for BEN-TEST-1 and BEN-TEST-2
  for (const ref of ["BEN-TEST-000001", "BEN-TEST-000002", "BEN-TEST-000004"]) {
    const benCase = await prisma.case.findUnique({ where: { reference: ref } })
    if (benCase) {
      await prisma.beneficiary.deleteMany({ where: { case_id: benCase.id } })
      await prisma.beneficiary.createMany({
        data: [
          {
            case_id: benCase.id,
            surname: "Waruiru",
            first_name: "Jane",
            relationship: "Spouse",
            national_id: "78901234",
            date_of_birth: new Date("1992-04-10"),
            allocation_percent: 60,
            is_minor: false,
          },
          {
            case_id: benCase.id,
            surname: "Waruiru",
            first_name: "Brian",
            relationship: "Child",
            national_id: "89012345",
            date_of_birth: new Date("2015-11-20"),
            allocation_percent: 40,
            is_minor: false,
          },
        ],
      })
    }
  }
  console.log("✓ J3 Kennedy beneficiary cases seeded")

  // ── J4 AVC ────────────────────────────────────────────────────────────────
  // AVC-TEST-1: PENDING_EMPLOYER NEW  → employer approve → EMPLOYER_APPROVED WA+email
  // AVC-TEST-2: PENDING_EMPLOYER VARY → employer reject  → EMPLOYER_REJECTED WA+email
  // AVC-TEST-3: UNDER_REVIEW    NEW   → PSSF approve     → CASE_APPROVED WA+email
  // AVC-TEST-4: COMPLETED CANCEL (historical)

  const avcForms = {
    "AVC-TEST-000001": { avc_action: "NEW", avc_method: "PAYROLL", new_amount: 5000, commencement_date: "2026-07-01" },
    "AVC-TEST-000002": { avc_action: "VARY", avc_method: "PAYROLL", current_amount: 5000, new_amount: 8000, effective_date: "2026-07-01" },
    "AVC-TEST-000003": { avc_action: "NEW", avc_method: "PAYROLL", new_amount: 3000, commencement_date: "2026-08-01" },
    "AVC-TEST-000004": { avc_action: "CANCEL", avc_method: "PAYROLL", current_amount: 3000, effective_date: "2026-03-01" },
  }

  for (const [ref, id, status] of [
    ["AVC-TEST-000001", "case-kenAvc1-0000-0000-00000001", CaseStatus.PENDING_EMPLOYER],
    ["AVC-TEST-000002", "case-kenAvc2-0000-0000-00000002", CaseStatus.PENDING_EMPLOYER],
    ["AVC-TEST-000003", "case-kenAvc3-0000-0000-00000003", CaseStatus.UNDER_REVIEW],
    ["AVC-TEST-000004", "case-kenAvc4-0000-0000-00000004", CaseStatus.COMPLETED],
  ] as const) {
    await prisma.case.upsert({
      where: { reference: ref },
      update: {},
      create: {
        id,
        reference: ref,
        type: CaseType.AVC,
        status,
        member_id: kennedyMember.id,
        employer_id: kennedyEmployer.id,
        submitted_at: new Date(),
        ...(status === CaseStatus.COMPLETED ? { completed_at: new Date("2026-04-01") } : {}),
        form_data: {
          national_id: "70469628",
          full_name: "Kennedy Waruiru",
          mobile_number: "+254704696287",
          declaration_accepted: true,
          ...avcForms[ref],
        } as any,
      },
    })
  }
  console.log("✓ J4 Kennedy AVC cases seeded")

  // ── J5 Benefits Claim ─────────────────────────────────────────────────────
  // CLM-TEST-1: PENDING_EMPLOYER  → employer approve → EMPLOYER_APPROVED WA+email
  // CLM-TEST-2: PENDING_EMPLOYER  → employer reject  → EMPLOYER_REJECTED WA+email
  // CLM-TEST-3: UNDER_REVIEW      → PSSF approve     → CASE_APPROVED WA+email
  // CLM-TEST-4: UNDER_REVIEW      → PSSF reject      → CASE_REJECTED WA+email
  // CLM-TEST-5: UNDER_REVIEW      → PSSF more info   → MORE_INFO_REQUIRED WA+email
  // CLM-TEST-6: APPROVED          → mark payment processing → PAYMENT_PROCESSING WA+email
  // CLM-TEST-7: PAYMENT_PROCESSING → mark paid        → CASE_COMPLETED WA+email

  const kenBenefitsForm = {
    national_id: "70469628",
    full_name: "Kennedy Waruiru",
    bank_account_number: "0987654321",
    bank_name: "Equity Bank",
    bank_branch: "Nairobi",
    mpesa_number: "+254704696287",
    date_of_leaving: "2026-05-15",
    reason_for_leaving: "NORMAL_RETIREMENT",
    benefit_option: "FULL_ANNUITY",
    payment_confirmed: true,
    preview_payment_confirmed: true,
    declaration_accepted: true,
  }

  for (const [ref, id, status] of [
    ["CLM-TEST-000001", "case-kenClm1-0000-0000-00000001", CaseStatus.PENDING_EMPLOYER],
    ["CLM-TEST-000002", "case-kenClm2-0000-0000-00000002", CaseStatus.PENDING_EMPLOYER],
    ["CLM-TEST-000003", "case-kenClm3-0000-0000-00000003", CaseStatus.UNDER_REVIEW],
    ["CLM-TEST-000004", "case-kenClm4-0000-0000-00000004", CaseStatus.UNDER_REVIEW],
    ["CLM-TEST-000005", "case-kenClm5-0000-0000-00000005", CaseStatus.UNDER_REVIEW],
    ["CLM-TEST-000006", "case-kenClm6-0000-0000-00000006", CaseStatus.APPROVED],
    ["CLM-TEST-000007", "case-kenClm7-0000-0000-00000007", CaseStatus.PAYMENT_PROCESSING],
  ] as const) {
    await prisma.case.upsert({
      where: { reference: ref },
      update: {},
      create: {
        id,
        reference: ref,
        type: CaseType.BENEFITS_CLAIM,
        status,
        member_id: kennedyMember.id,
        employer_id: kennedyEmployer.id,
        submitted_at: new Date(),
        form_data: kenBenefitsForm as any,
      },
    })
  }

  // Add employer approval to CLM-TEST-3/4/5 so they show up in PSSF review queue
  for (const ref of ["CLM-TEST-000003", "CLM-TEST-000004", "CLM-TEST-000005"]) {
    const c = await prisma.case.findUnique({ where: { reference: ref } })
    if (c) {
      await prisma.approval.deleteMany({ where: { case_id: c.id, type: ApprovalType.EMPLOYER } })
      await prisma.approval.create({
        data: {
          case_id: c.id,
          type: ApprovalType.EMPLOYER,
          decision: ApprovalDecision.APPROVED,
          actor_id: kennedyEmployerUser.id,
          actor_name: "Kennedy Waruiru",
          actor_role: "EMPLOYER",
          actor_org: kennedyEmployer.name,
          comments: JSON.stringify({ officer_name: "Kennedy Waruiru", designation: "HR Director" }),
        },
      })
    }
  }

  // Documents on CLM-TEST-3 (UNDER_REVIEW) for document verification testing
  const kenClm3 = await prisma.case.findUnique({ where: { reference: "CLM-TEST-000003" } })
  if (kenClm3) {
    await prisma.document.deleteMany({ where: { case_id: kenClm3.id } })
    await prisma.document.createMany({
      data: [
        { case_id: kenClm3.id, document_type: "EXIT_LETTER", status: DocumentStatus.VERIFIED, file_name: "exit_letter.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: kenClm3.id, document_type: "NATIONAL_ID", status: DocumentStatus.VERIFIED, file_name: "national_id.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: kenClm3.id, document_type: "ATM_CARD", status: DocumentStatus.UNDER_REVIEW, file_name: "atm_card.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: kenClm3.id, document_type: "KRA_PIN", status: DocumentStatus.VERIFIED, file_name: "kra_pin.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
      ],
    })
  }
  console.log("✓ J5 Kennedy benefits claim cases seeded")

  // ── J6 Death Benefits Claim (Kennedy as claimant) ─────────────────────────
  // DCL-TEST-1: SUBMITTED         → PSSF intake
  // DCL-TEST-2: UNDER_VERIFICATION → documents under review
  // DCL-TEST-3: AWAITING_TRUSTEE  → trustee decision pending

  const kenDeathForm = {
    deceased_member_id: members[0].id,
    full_name: members[0].full_name,
    national_id: members[0].national_id,
    date_of_death: "2025-12-01",
    county: "Nairobi",
    subcounty: "Westlands",
    location: "Parklands",
    sublocation: "Highridge",
    village: "Kitisuru",
    chief_name: "Chief Njoroge",
    benefit_option: "FULL_LUMPSUM",
    claimants: [
      {
        name: "Kennedy Waruiru",
        relationship: "Sibling",
        national_id: "70469628",
        mobile_number: "+254704696287",
        is_minor: false,
        bank_account_number: "0987654321",
        bank_name: "Equity Bank",
        bank_branch: "Nairobi",
      },
    ],
    has_spouse_claimant: false,
    has_child_claimant: false,
    has_minor_claimant: false,
    witness_name: "James Otieno",
    witness_id: "55443322",
    witness_signature: "James Otieno",
    witness_date: "2025-12-05",
    declaration_accepted: true,
    claimant_user_id: kennedyMemberUser.id,
  }

  for (const [ref, id, status] of [
    ["DCL-TEST-000001", "case-kenDcl1-0000-0000-00000001", CaseStatus.SUBMITTED],
    ["DCL-TEST-000002", "case-kenDcl2-0000-0000-00000002", CaseStatus.UNDER_VERIFICATION],
    ["DCL-TEST-000003", "case-kenDcl3-0000-0000-00000003", CaseStatus.AWAITING_TRUSTEE],
  ] as const) {
    await prisma.case.upsert({
      where: { reference: ref },
      update: {},
      create: {
        id,
        reference: ref,
        type: CaseType.DEATH_BENEFITS_CLAIM,
        status,
        member_id: members[0].id,
        employer_id: moti.id,
        claimant_name: "Kennedy Waruiru",
        submitted_at: new Date(),
        form_data: kenDeathForm as any,
      },
    })
  }

  // Documents on DCL-TEST-2
  const kenDcl2 = await prisma.case.findUnique({ where: { reference: "DCL-TEST-000002" } })
  if (kenDcl2) {
    await prisma.document.deleteMany({ where: { case_id: kenDcl2.id } })
    await prisma.document.createMany({
      data: [
        { case_id: kenDcl2.id, document_type: "DEATH_CERTIFICATE", status: DocumentStatus.VERIFIED, file_name: "death_cert.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: kenDcl2.id, document_type: "NATIONAL_ID", status: DocumentStatus.UNDER_REVIEW, file_name: "claimant_id.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
        { case_id: kenDcl2.id, document_type: "ATM_CARD", status: DocumentStatus.PENDING, file_name: "atm.pdf", file_data: placeholderPdf, mime_type: "application/pdf", file_size_kb: 1 },
      ],
    })
  }
  console.log("✓ J6 Kennedy death benefits cases seeded")

  // ── Discrepancy & Missing Contribution ────────────────────────────────────
  // DIS-TEST-1: UNDER_REVIEW → PSSF can process
  // MCR-TEST-1: UNDER_REVIEW → PSSF can process

  await prisma.case.upsert({
    where: { reference: "DIS-TEST-000001" },
    update: {},
    create: {
      id: "case-kenDis1-0000-0000-00000001",
      reference: "DIS-TEST-000001",
      type: CaseType.DISCREPANCY,
      status: CaseStatus.UNDER_REVIEW,
      member_id: kennedyMember.id,
      employer_id: kennedyEmployer.id,
      submitted_at: new Date(),
      form_data: {
        field_name: "EMPLOYER",
        field_category: "EMPLOYMENT",
        correct_information: "Kenya Test Ministry",
        explanation: "Test discrepancy — employer name correction.",
      } as any,
    },
  })

  await prisma.case.upsert({
    where: { reference: "MCR-TEST-000001" },
    update: {},
    create: {
      id: "case-kenMcr1-0000-0000-00000001",
      reference: "MCR-TEST-000001",
      type: CaseType.MISSING_CONTRIBUTION,
      status: CaseStatus.UNDER_REVIEW,
      member_id: kennedyMember.id,
      employer_id: kennedyEmployer.id,
      submitted_at: new Date(),
      form_data: {
        month: "2026-04",
        contribution_type: "BOTH",
        explanation: "April 2026 contributions not reflected on statement.",
        employer_name: kennedyEmployer.name,
      } as any,
    },
  })
  console.log("✓ Kennedy discrepancy + missing contribution cases seeded")

  // Notification rules
  const { execSync } = await import("child_process")
  execSync("npx tsx prisma/seed-notifications.ts", { stdio: "inherit", cwd: process.cwd() })
  console.log("✓ Seed complete")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

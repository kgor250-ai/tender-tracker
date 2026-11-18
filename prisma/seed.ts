import { PrismaClient, RoleName, UserStatus, TenderStatus, AmendmentType, ReviewStatus, VerificationStatus, SourceMethod, ImpactLevel, ActorType } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Helper to simulate secure password hash (in real app, bcrypt.hashSync('Password@123', 10))
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_salt_demo').digest('hex');
}

async function main() {
  console.log('🌱 Starting Tender Corrigendum & Amendment Tracker Database Seeding...');

  // 1. Roles
  console.log('Creating Roles...');
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: RoleName.SUPER_ADMIN },
      update: {},
      create: {
        name: RoleName.SUPER_ADMIN,
        description: 'Full administrative access, user role management, source adapters, audit logs',
      },
    }),
    prisma.role.upsert({
      where: { name: RoleName.REVIEWER },
      update: {},
      create: {
        name: RoleName.REVIEWER,
        description: 'Tender creation, corrigendum intake, diff verification, approve/reject changes',
      },
    }),
    prisma.role.upsert({
      where: { name: RoleName.REGISTERED_USER },
      update: {},
      create: {
        name: RoleName.REGISTERED_USER,
        description: 'Public search, follow tenders, receive amendment alerts, view public diffs',
      },
    }),
    prisma.role.upsert({
      where: { name: RoleName.SYSTEM_AGENT },
      update: {},
      create: {
        name: RoleName.SYSTEM_AGENT,
        description: 'Automated crawlers, OCR workers, and notification dispatchers',
      },
    }),
  ]);

  const superAdminRole = roles.find((r) => r.name === RoleName.SUPER_ADMIN)!;
  const reviewerRole = roles.find((r) => r.name === RoleName.REVIEWER)!;
  const userRole = roles.find((r) => r.name === RoleName.REGISTERED_USER)!;

  // 2. Default Users
  console.log('Creating Users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tender-tracker.local' },
    update: {},
    create: {
      email: 'admin@tender-tracker.local',
      name: 'Executive Super Admin',
      passwordHash: hashPassword('Admin@12345'),
      status: UserStatus.ACTIVE,
      roles: {
        create: { roleId: superAdminRole.id },
      },
    },
  });

  const reviewerUser = await prisma.user.upsert({
    where: { email: 'reviewer@tender-tracker.local' },
    update: {},
    create: {
      email: 'reviewer@tender-tracker.local',
      name: 'Senior Procurement Reviewer',
      passwordHash: hashPassword('Reviewer@12345'),
      status: UserStatus.ACTIVE,
      roles: {
        create: { roleId: reviewerRole.id },
      },
    },
  });

  const contractorUser = await prisma.user.upsert({
    where: { email: 'contractor@example.com' },
    update: {},
    create: {
      email: 'contractor@example.com',
      name: 'Sharma Infrastructure Pvt Ltd (Contractor)',
      passwordHash: hashPassword('User@12345'),
      status: UserStatus.ACTIVE,
      roles: {
        create: { roleId: userRole.id },
      },
    },
  });

  // 3. Organization & Department
  console.log('Creating Organization & Department...');
  const org = await prisma.organization.upsert({
    where: { code: 'PWD-DEMO' },
    update: {},
    create: {
      name: 'Demo Public Works Organization',
      normalizedName: 'demo public works organization',
      code: 'PWD-DEMO',
    },
  });

  const dept = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: 'Demo Public Works Department',
      code: 'PWD-ROADS',
    },
  });

  // 4. Portal Source
  console.log('Creating Portal Source...');
  const portalSource = await prisma.portalSource.create({
    data: {
      name: 'Central Public Procurement Portal (Demo)',
      baseUrl: 'https://eprocure.demo.gov.in',
      adapterKey: 'cppp-adapter',
      collectionMethod: SourceMethod.API,
      isEnabled: true,
      scheduleCron: '0 */6 * * *',
      rateLimitDelayMs: 2500,
      termsReviewedAt: new Date(),
    },
  });

  // 5. Tender Master (Appendix B.1 Fictional Tender)
  console.log('Creating Tender Master: DEMO/PWD/2026/001...');
  const publicationDate = new Date('2026-11-10T09:00:00+05:30');
  const initialDeadline = new Date('2026-11-20T17:00:00+05:30');

  const tender = await prisma.tender.create({
    data: {
      sourceId: portalSource.id,
      sourceTenderRef: 'PORTAL-DEMO-2026-9901',
      tenderNumber: 'DEMO/PWD/2026/001',
      normalizedTenderNumber: 'DEMOPWD2026001',
      title: 'Demonstration road maintenance and widening works - Sector 4 to 8 Corridor',
      departmentId: dept.id,
      status: TenderStatus.AMENDED,
      publicationDate: publicationDate,
      submissionDeadline: new Date('2026-11-25T17:00:00+05:30'), // Updated after Corrigendum 01
      estimatedValue: 5000000.0,
      currency: 'INR',
      category: 'Civil Works',
      location: 'Gujarat, India',
      sourceUrl: 'https://eprocure.demo.gov.in/notice/DEMO-PWD-2026-001',
    },
  });

  // Initial Tender Version (v1)
  await prisma.tenderVersion.create({
    data: {
      tenderId: tender.id,
      versionNumber: 1,
      eventType: 'INITIAL_PUBLICATION',
      snapshotJson: {
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        status: 'PUBLISHED',
        publicationDate: publicationDate.toISOString(),
        submissionDeadline: initialDeadline.toISOString(),
        estimatedValue: 5000000.0,
        currency: 'INR',
        eligibilityExperienceYears: 5,
      },
      createdBy: adminUser.id,
      createdAt: publicationDate,
    },
  });

  // Original Tender Document
  const docNotice = await prisma.document.create({
    data: {
      tenderId: tender.id,
      objectKey: 'tenders/2026/DEMOPWD2026001/notice_inviting_tender.pdf',
      originalFilename: 'NIT_DEMO_PWD_2026_001.pdf',
      mimeType: 'application/pdf',
      sizeBytes: BigInt(2457600),
      sha256: crypto.createHash('sha256').update('NIT_ORIGINAL_DOCUMENT_CONTENT').digest('hex'),
      pageCount: 18,
    },
  });

  // 6. User Follows Tender
  await prisma.followedTender.create({
    data: {
      userId: contractorUser.id,
      tenderId: tender.id,
      notificationPreferencesJson: { email: true, inApp: true },
    },
  });

  // 7. Corrigendum 01 (13-Nov-2026) - Deadline Extension (APPROVED -> Version 2)
  console.log('Creating Corrigendum 01...');
  const corr01PubDate = new Date('2026-11-13T11:00:00+05:30');
  const corr01 = await prisma.amendment.create({
    data: {
      tenderId: tender.id,
      sourceAmendmentRef: 'CORR-01-DEMO-9901',
      amendmentNumber: 'Corrigendum 01',
      title: 'Extension of Online Bid Submission Deadline and Clarification on Pre-Bid Queries',
      description: 'The last date for submission of bids has been extended by five days due to administrative requests.',
      publicationDate: corr01PubDate,
      amendmentType: AmendmentType.DEADLINE_EXTENSION,
      reviewStatus: ReviewStatus.APPROVED,
      sourceUrl: 'https://eprocure.demo.gov.in/notice/DEMO-PWD-2026-001/corr1',
      createdAt: corr01PubDate,
    },
  });

  await prisma.amendmentChange.create({
    data: {
      amendmentId: corr01.id,
      fieldKey: 'submissionDeadline',
      changeType: 'MODIFIED',
      oldValue: '2026-11-20T17:00:00+05:30',
      newValue: '2026-11-25T17:00:00+05:30',
      confidence: 0.985,
      evidenceJson: {
        documentId: docNotice.id,
        pageNumber: 1,
        excerpt: 'Item 4: The last date of bid submission is hereby extended up to 25-Nov-2026, 17:00 Hrs IST.',
      },
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });

  await prisma.reviewRecord.create({
    data: {
      amendmentId: corr01.id,
      reviewerId: reviewerUser.id,
      decision: 'APPROVE',
      notes: 'Verified against official department notification signed by Executive Engineer.',
      reviewedAt: corr01PubDate,
    },
  });

  // Tender Version 2
  await prisma.tenderVersion.create({
    data: {
      tenderId: tender.id,
      versionNumber: 2,
      eventType: 'CORRIGENDUM_APPLIED',
      snapshotJson: {
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        status: 'AMENDED',
        publicationDate: publicationDate.toISOString(),
        submissionDeadline: '2026-11-25T17:00:00+05:30',
        estimatedValue: 5000000.0,
        currency: 'INR',
        appliedCorrigendum: 'Corrigendum 01',
      },
      createdBy: reviewerUser.id,
      createdAt: corr01PubDate,
    },
  });

  // Notification for Corrigendum 01
  await prisma.notification.create({
    data: {
      userId: contractorUser.id,
      amendmentId: corr01.id,
      channel: 'IN_APP',
      status: 'DELIVERED',
      subject: 'Deadline Extended: DEMO/PWD/2026/001',
      payloadJson: {
        tenderNumber: 'DEMO/PWD/2026/001',
        amendmentNumber: 'Corrigendum 01',
        oldDeadline: '20-Nov-2026',
        newDeadline: '25-Nov-2026',
      },
      sentAt: corr01PubDate,
    },
  });

  // 8. Corrigendum 02 (16-Nov-2026) - Eligibility Criteria (APPROVED -> Version 3)
  console.log('Creating Corrigendum 02...');
  const corr02PubDate = new Date('2026-11-16T14:30:00+05:30');
  const corr02 = await prisma.amendment.create({
    data: {
      tenderId: tender.id,
      sourceAmendmentRef: 'CORR-02-DEMO-9901',
      amendmentNumber: 'Corrigendum 02',
      title: 'Amendment in Technical Qualification - Prior Road Experience Criterion',
      description: 'Minimum required experience in similar highway/corridor maintenance modified from 5 years to 3 years.',
      publicationDate: corr02PubDate,
      amendmentType: AmendmentType.ELIGIBILITY_CRITERIA,
      reviewStatus: ReviewStatus.APPROVED,
      sourceUrl: 'https://eprocure.demo.gov.in/notice/DEMO-PWD-2026-001/corr2',
      createdAt: corr02PubDate,
    },
  });

  await prisma.amendmentChange.create({
    data: {
      amendmentId: corr02.id,
      fieldKey: 'eligibilityExperienceYears',
      changeType: 'MODIFIED',
      oldValue: '5 years',
      newValue: '3 years',
      confidence: 0.94,
      evidenceJson: {
        pageNumber: 2,
        excerpt: 'Clause 7.2 (Eligibility): Bidders possessing a minimum of 3 (three) years of continuous experience in bituminous road works shall be deemed eligible.',
      },
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });

  await prisma.reviewRecord.create({
    data: {
      amendmentId: corr02.id,
      reviewerId: reviewerUser.id,
      decision: 'APPROVE',
      notes: 'Approved amendment following committee decision to foster broader MSME competition.',
      reviewedAt: corr02PubDate,
    },
  });

  // Tender Version 3
  await prisma.tenderVersion.create({
    data: {
      tenderId: tender.id,
      versionNumber: 3,
      eventType: 'CORRIGENDUM_APPLIED',
      snapshotJson: {
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        status: 'AMENDED',
        submissionDeadline: '2026-11-25T17:00:00+05:30',
        eligibilityExperienceYears: 3,
        appliedCorrigendum: 'Corrigendum 02',
      },
      createdBy: reviewerUser.id,
      createdAt: corr02PubDate,
    },
  });

  // 9. Corrigendum 03 (19-Nov-2026) - Technical Spec Replacement (NEEDS_REVIEW)
  console.log('Creating Corrigendum 03 (In Review Queue)...');
  const corr03PubDate = new Date('2026-11-19T10:15:00+05:30');
  const corr03 = await prisma.amendment.create({
    data: {
      tenderId: tender.id,
      sourceAmendmentRef: 'CORR-03-DEMO-9901',
      amendmentNumber: 'Corrigendum 03',
      title: 'Revision of Technical Specifications & BOQ Schedule B - Asphalt Grade',
      description: 'Modified bituminous concrete mix design standards from VG-30 to VG-40 specification.',
      publicationDate: corr03PubDate,
      amendmentType: AmendmentType.TECHNICAL_SPECIFICATION,
      reviewStatus: ReviewStatus.NEEDS_REVIEW,
      sourceUrl: 'https://eprocure.demo.gov.in/notice/DEMO-PWD-2026-001/corr3',
      createdAt: corr03PubDate,
    },
  });

  await prisma.amendmentChange.create({
    data: {
      amendmentId: corr03.id,
      fieldKey: 'bituminousAsphaltGrade',
      changeType: 'MODIFIED',
      oldValue: 'Viscosity Grade VG-30 bitumen',
      newValue: 'Viscosity Grade VG-40 modified bitumen conforming to IS 73:2013',
      confidence: 0.91,
      evidenceJson: {
        pageNumber: 3,
        paragraph: 'Section 4.12: Mix Design',
        excerpt: 'All wearing courses shall strictly deploy VG-40 paving grade bitumen in lieu of VG-30 specified earlier.',
      },
      verificationStatus: VerificationStatus.PENDING,
    },
  });

  await prisma.changeAnalysis.create({
    data: {
      amendmentId: corr03.id,
      modelOrRuleVersion: 'rule-engine-v1.4',
      summary: 'Corrigendum 03 upgrades the pavement bitumen specification to VG-40, potentially impacting unit rate estimations.',
      impactLevel: ImpactLevel.HIGH,
      categoriesJson: ['TECHNICAL_SPECIFICATION', 'BOQ_ALTERATION'],
      status: 'COMPLETED',
    },
  });

  // 10. Audit Log
  console.log('Creating Audit Logs...');
  await prisma.auditLog.create({
    data: {
      actorType: ActorType.USER,
      actorId: adminUser.id,
      action: 'TENDER_CREATED',
      resourceType: 'Tender',
      resourceId: tender.id,
      beforeJson: null,
      afterJson: { tenderNumber: tender.tenderNumber, status: 'PUBLISHED' },
      ipHash: crypto.createHash('sha256').update('127.0.0.1').digest('hex'),
      createdAt: publicationDate,
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('==============================================================');
  console.log('Default Accounts:');
  console.log('  Admin:    admin@tender-tracker.local    / Admin@12345');
  console.log('  Reviewer: reviewer@tender-tracker.local / Reviewer@12345');
  console.log('  User:     contractor@example.com        / User@12345');
  console.log('Tender Seeded: DEMO/PWD/2026/001 with Corrigenda 01, 02, 03');
  console.log('==============================================================');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


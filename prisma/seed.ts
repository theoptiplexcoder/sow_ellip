import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Only three personas exist platform-wide (PRD §4). Day-to-day project roles
// (Creator/Approver/Executive Viewer) are per-project assignments held by a
// Participant, not separate personas.
const DEMO_PERSONAS = ['Superadmin', 'Tenant Admin', 'Participant'] as const;

async function main() {
  const tenant = await prisma.tenant.create({ data: { name: 'Demo Tenant' } });

  for (const persona of DEMO_PERSONAS) {
    await prisma.user.create({ data: { tenantId: tenant.id } });
    console.log(`Seeded demo user for persona: ${persona}`);
  }

  const project = await prisma.project.create({
    data: { tenantId: tenant.id },
  });
  const participant = await prisma.user.create({
    data: { tenantId: tenant.id },
  });

  // Demonstrates a single Participant holding multiple project roles (PRD §6).
  for (const projectRole of ['creator', 'approver'] as const) {
    await prisma.projectRoleAssignment.create({
      data: {
        tenantId: tenant.id,
        projectId: project.id,
        userId: participant.id,
        projectRole,
      },
    });
    console.log(`Assigned project role "${projectRole}" to demo Participant`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

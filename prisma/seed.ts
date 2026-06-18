import "dotenv/config";
import { prisma } from "../src/infra/db/client";
import { passwordHasher, tokenGenerator } from "../src/infra/services";

async function main() {
  const email = "styrelse@solrosen.se";
  if (await prisma.user.findUnique({ where: { email } })) {
    console.log("Seed redan körd – hoppar över.");
    return;
  }

  const brf = await prisma.brf.create({
    data: { name: "Brf Solrosen", orgNumber: "769600-1234" },
  });

  const pw = await passwordHasher.hash("losenord123");
  const [admin, resident] = await Promise.all([
    prisma.user.create({
      data: {
        email,
        name: "Anna Ordförande",
        passwordHash: pw,
        role: "STYRELSE",
        brfId: brf.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "boende@solrosen.se",
        name: "Björn Boende",
        passwordHash: pw,
        role: "BOENDE",
        apartment: "1201",
        brfId: brf.id,
      },
    }),
  ]);

  await prisma.post.create({
    data: {
      title: "Välkommen till portalen!",
      body: "Nu kan ni felanmäla, boka tvättstuga och se nyheter digitalt.",
      brfId: brf.id,
      authorId: admin.id,
    },
  });

  await prisma.resource.createMany({
    data: [
      { name: "Tvättstuga 1", brfId: brf.id },
      { name: "Gästlägenhet", brfId: brf.id },
    ],
  });

  const issue = await prisma.issue.create({
    data: {
      title: "Trasig lampa i trapphus B",
      description: "Lampan på plan 3 fungerar inte.",
      location: "Trapphus B, plan 3",
      status: "TRIAGE",
      brfId: brf.id,
      authorId: resident.id,
    },
  });

  const job = await prisma.job.create({
    data: {
      title: "Måla om trapphus B",
      description:
        "Trapphus B behöver målas om, plan 1–5. Vita väggar, halvblank färg. Ange pris och tidsåtgång.",
      status: "PUBLICERAT",
      publicToken: tokenGenerator.generate(),
      brfId: brf.id,
      issueId: issue.id,
    },
  });

  await prisma.bid.createMany({
    data: [
      {
        jobId: job.id,
        companyName: "Målarna AB",
        contactName: "Carl Målare",
        contactEmail: "carl@malarna.se",
        contactPhone: "070-1234567",
        priceSek: 45000,
        estimatedDays: 5,
        message: "Vi kan börja nästa vecka.",
      },
      {
        jobId: job.id,
        companyName: "Stockholms Måleri",
        contactName: "Disa Penselsson",
        contactEmail: "disa@sthlmmaleri.se",
        priceSek: 52000,
        estimatedDays: 4,
      },
    ],
  });

  console.log("Seed klar.");
  console.log("Logga in som styrelse:", email, "/ losenord123");
  console.log(`Publik budlänk: /uppdrag/${job.publicToken}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

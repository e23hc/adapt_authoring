import { Prisma, PrismaClient } from "@prisma/client";
import { registry } from "@adapt-next/content-schemas";

const prisma = new PrismaClient();

const DEV_USER = { id: "dev-user", email: "dev@adapt-next.local", name: "Dev User" };

async function main() {
  const dev = await prisma.user.upsert({ where: { id: DEV_USER.id }, update: {}, create: DEV_USER });

  // Idempotent: clear the dev user's courses and reseed.
  await prisma.course.deleteMany({ where: { ownerId: dev.id } });

  const course = await prisma.course.create({
    data: {
      title: "Welcome to Adapt Next",
      displayTitle: "Welcome to Adapt Next",
      body: "<p>A short demo course showing all five MVP component types.</p>",
      ownerId: dev.id,
      config: { create: {} },
    },
  });
  const courseId = course.id;

  const page = (title: string, sortOrder: number) =>
    prisma.contentObject.create({
      data: { courseId, title, displayTitle: title, kind: "page", sortOrder },
    });
  const article = (pageId: string, title: string, sortOrder: number) =>
    prisma.article.create({ data: { courseId, pageId, title, displayTitle: title, sortOrder } });
  const block = (articleId: string, title: string, sortOrder: number) =>
    prisma.block.create({ data: { courseId, articleId, title, displayTitle: title, sortOrder } });
  const component = (
    blockId: string,
    type: string,
    sortOrder: number,
    opts: { title?: string; displayTitle?: string; body?: string; layout?: "full" | "left" | "right"; properties?: Record<string, unknown> } = {},
  ) =>
    prisma.component.create({
      data: {
        courseId,
        blockId,
        component: type,
        layout: opts.layout ?? "full",
        title: opts.title ?? type,
        displayTitle: opts.displayTitle ?? opts.title ?? "",
        body: opts.body ?? null,
        sortOrder,
        properties: (opts.properties ?? registry.getDefaults(type)) as Prisma.InputJsonValue,
      },
    });

  // Page 1 — Introduction
  const p1 = await page("Introduction", 1);
  const a1 = await article(p1.id, "Getting started", 1);
  const b1 = await block(a1.id, "Overview", 1);
  await component(b1.id, "text", 1, {
    title: "Welcome",
    displayTitle: "Welcome",
    body: "<p>This is a <strong>text</strong> component authored with a schema-driven form.</p>",
    layout: "left",
  });
  await component(b1.id, "graphic", 2, {
    title: "Diagram",
    displayTitle: "A placeholder image",
    layout: "right",
    properties: {
      _graphic: { src: "https://picsum.photos/seed/adaptnext/640/360", alt: "Placeholder diagram", attribution: "picsum.photos" },
    },
  });
  const b2 = await block(a1.id, "Watch", 2);
  await component(b2.id, "media", 1, {
    title: "Intro video",
    displayTitle: "Watch the introduction",
    properties: {
      _media: {
        source: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        poster: "",
        type: "video",
      },
    },
  });

  // Page 2 — Knowledge check
  const p2 = await page("Knowledge check", 2);
  const a2 = await article(p2.id, "Quiz", 1);
  const b3 = await block(a2.id, "Questions", 1);
  await component(b3.id, "mcq", 1, {
    title: "Question 1",
    displayTitle: "Which framework are we modernising?",
    properties: {
      instruction: "Choose the correct answer.",
      _isRandom: false,
      _selectable: 1,
      _items: [
        { text: "Adapt", _shouldBeSelected: true, feedback: "" },
        { text: "Articulate", _shouldBeSelected: false, feedback: "" },
        { text: "Captivate", _shouldBeSelected: false, feedback: "" },
      ],
      _feedback: { correct: "Correct — this is an Adapt-inspired tool.", incorrect: "Not quite — try again." },
    },
  });
  const b4 = await block(a2.id, "More", 2);
  await component(b4.id, "accordion", 1, {
    title: "Learn more",
    displayTitle: "Frequently asked questions",
  });

  console.log(`Seeded course "${course.title}" (${courseId}) with 2 pages and 5 components.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

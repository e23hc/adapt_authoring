-- CreateEnum
CREATE TYPE "ContentObjectKind" AS ENUM ('menu', 'page');

-- CreateEnum
CREATE TYPE "ComponentLayout" AS ENUM ('full', 'left', 'right');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "displayTitle" TEXT,
    "body" TEXT,
    "classes" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extensions" JSONB NOT NULL DEFAULT '{}',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseConfig" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'adapt-contrib-vanilla',
    "menu" TEXT NOT NULL DEFAULT 'adapt-contrib-boxMenu',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "defaultDirection" TEXT NOT NULL DEFAULT 'ltr',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "enabledComponents" JSONB NOT NULL DEFAULT '[]',
    "enabledExtensions" JSONB NOT NULL DEFAULT '[]',
    "themeSettings" JSONB NOT NULL DEFAULT '{}',
    "menuSettings" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "CourseConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentObject" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "parentObjectId" TEXT,
    "kind" "ContentObjectKind" NOT NULL DEFAULT 'page',
    "sortOrder" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "displayTitle" TEXT,
    "body" TEXT,
    "classes" TEXT NOT NULL DEFAULT '',
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "graphic" JSONB,
    "extensions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "displayTitle" TEXT,
    "body" TEXT,
    "classes" TEXT NOT NULL DEFAULT '',
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "extensions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "displayTitle" TEXT,
    "body" TEXT,
    "classes" TEXT NOT NULL DEFAULT '',
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "layoutOptions" JSONB NOT NULL DEFAULT '[]',
    "extensions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Component" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 1,
    "component" TEXT NOT NULL,
    "layout" "ComponentLayout" NOT NULL DEFAULT 'full',
    "title" TEXT NOT NULL,
    "displayTitle" TEXT,
    "body" TEXT,
    "classes" TEXT NOT NULL DEFAULT '',
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "extensions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Course_ownerId_idx" ON "Course"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseConfig_courseId_key" ON "CourseConfig"("courseId");

-- CreateIndex
CREATE INDEX "ContentObject_courseId_idx" ON "ContentObject"("courseId");

-- CreateIndex
CREATE INDEX "ContentObject_parentObjectId_sortOrder_idx" ON "ContentObject"("parentObjectId", "sortOrder");

-- CreateIndex
CREATE INDEX "Article_courseId_idx" ON "Article"("courseId");

-- CreateIndex
CREATE INDEX "Article_pageId_sortOrder_idx" ON "Article"("pageId", "sortOrder");

-- CreateIndex
CREATE INDEX "Block_courseId_idx" ON "Block"("courseId");

-- CreateIndex
CREATE INDEX "Block_articleId_sortOrder_idx" ON "Block"("articleId", "sortOrder");

-- CreateIndex
CREATE INDEX "Component_courseId_idx" ON "Component"("courseId");

-- CreateIndex
CREATE INDEX "Component_blockId_sortOrder_idx" ON "Component"("blockId", "sortOrder");

-- CreateIndex
CREATE INDEX "Component_component_idx" ON "Component"("component");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseConfig" ADD CONSTRAINT "CourseConfig_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentObject" ADD CONSTRAINT "ContentObject_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentObject" ADD CONSTRAINT "ContentObject_parentObjectId_fkey" FOREIGN KEY ("parentObjectId") REFERENCES "ContentObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "ContentObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Component" ADD CONSTRAINT "Component_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Component" ADD CONSTRAINT "Component_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

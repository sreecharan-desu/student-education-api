-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('QUIZ', 'ASSIGNMENT', 'HOMEWORK', 'EXAM');

-- CreateEnum
CREATE TYPE "TaskPublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StudentTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('LESSON', 'CHAPTER', 'SECTION');

-- CreateEnum
CREATE TYPE "AudienceType" AS ENUM ('ALL_STUDENTS', 'CLASS');

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "avatar_url" TEXT,
    "class_level" INTEGER NOT NULL,
    "board" TEXT NOT NULL,
    "medium" TEXT,
    "academic_year" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "icon_key" TEXT,
    "class_level" INTEGER NOT NULL,
    "board" TEXT NOT NULL,
    "medium" TEXT,
    "academic_year" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_tasks" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "task_type" "TaskType" NOT NULL,
    "subject_id" UUID NOT NULL,
    "class_level" INTEGER NOT NULL,
    "academic_year" TEXT NOT NULL,
    "due_at" TIMESTAMP(3),
    "available_from" TIMESTAMP(3),
    "status" "TaskPublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_tasks" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "status" "StudentTaskStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_items" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content_type" "ContentType" NOT NULL DEFAULT 'LESSON',
    "parent_id" UUID,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_learning_progress" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "learning_item_id" UUID NOT NULL,
    "progress_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_position" TEXT,
    "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_learning_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "audience_type" "AudienceType" NOT NULL DEFAULT 'ALL_STUDENTS',
    "class_level" INTEGER,
    "academic_year" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_reads" (
    "id" UUID NOT NULL,
    "announcement_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "learning_item_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE INDEX "students_class_level_board_academic_year_idx" ON "students"("class_level", "board", "academic_year");

-- CreateIndex
CREATE INDEX "subjects_class_level_board_academic_year_is_active_idx" ON "subjects"("class_level", "board", "academic_year", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_class_level_board_academic_year_medium_key" ON "subjects"("code", "class_level", "board", "academic_year", "medium");

-- CreateIndex
CREATE INDEX "learning_tasks_class_level_academic_year_status_idx" ON "learning_tasks"("class_level", "academic_year", "status");

-- CreateIndex
CREATE INDEX "learning_tasks_subject_id_idx" ON "learning_tasks"("subject_id");

-- CreateIndex
CREATE INDEX "learning_tasks_due_at_idx" ON "learning_tasks"("due_at");

-- CreateIndex
CREATE INDEX "student_tasks_student_id_status_idx" ON "student_tasks"("student_id", "status");

-- CreateIndex
CREATE INDEX "student_tasks_task_id_idx" ON "student_tasks"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_tasks_student_id_task_id_key" ON "student_tasks"("student_id", "task_id");

-- CreateIndex
CREATE INDEX "learning_items_subject_id_is_published_idx" ON "learning_items"("subject_id", "is_published");

-- CreateIndex
CREATE INDEX "learning_items_parent_id_idx" ON "learning_items"("parent_id");

-- CreateIndex
CREATE INDEX "student_learning_progress_student_id_last_accessed_at_idx" ON "student_learning_progress"("student_id", "last_accessed_at");

-- CreateIndex
CREATE UNIQUE INDEX "student_learning_progress_student_id_learning_item_id_key" ON "student_learning_progress"("student_id", "learning_item_id");

-- CreateIndex
CREATE INDEX "announcements_audience_type_class_level_academic_year_is_pu_idx" ON "announcements"("audience_type", "class_level", "academic_year", "is_published");

-- CreateIndex
CREATE INDEX "announcements_published_at_idx" ON "announcements"("published_at");

-- CreateIndex
CREATE INDEX "announcement_reads_student_id_idx" ON "announcement_reads"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_reads_announcement_id_student_id_key" ON "announcement_reads"("announcement_id", "student_id");

-- CreateIndex
CREATE INDEX "bookmarks_student_id_created_at_idx" ON "bookmarks"("student_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_student_id_learning_item_id_key" ON "bookmarks"("student_id", "learning_item_id");

-- AddForeignKey
ALTER TABLE "learning_tasks" ADD CONSTRAINT "learning_tasks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_tasks" ADD CONSTRAINT "student_tasks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_tasks" ADD CONSTRAINT "student_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "learning_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_items" ADD CONSTRAINT "learning_items_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_items" ADD CONSTRAINT "learning_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "learning_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_learning_progress" ADD CONSTRAINT "student_learning_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_learning_progress" ADD CONSTRAINT "student_learning_progress_learning_item_id_fkey" FOREIGN KEY ("learning_item_id") REFERENCES "learning_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_learning_item_id_fkey" FOREIGN KEY ("learning_item_id") REFERENCES "learning_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

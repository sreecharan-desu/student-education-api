import { PrismaClient, TaskType, TaskPublicationStatus, StudentTaskStatus, ContentType, AudienceType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Student Education Dashboard (AP State Board 2026-2027)...');

  // 1. Password Hashing
  const defaultPassword = 'Student@2026!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 2. Demo Students
  const demoStudent = await prisma.student.upsert({
    where: { email: 'student@vidya.local' },
    update: {
      fullName: 'Aditya Varma',
      classLevel: 8,
      board: 'Andhra Pradesh State Board',
      medium: 'English',
      academicYear: '2026-2027',
      passwordHash,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    create: {
      email: 'student@vidya.local',
      fullName: 'Aditya Varma',
      classLevel: 8,
      board: 'Andhra Pradesh State Board',
      medium: 'English',
      academicYear: '2026-2027',
      passwordHash,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const peerStudent = await prisma.student.upsert({
    where: { email: 'sita.r@vidya.local' },
    update: {
      fullName: 'Sita Ramulu',
      classLevel: 8,
      board: 'Andhra Pradesh State Board',
      medium: 'English',
      academicYear: '2026-2027',
      passwordHash,
      isActive: true,
      avatarUrl: null,
    },
    create: {
      email: 'sita.r@vidya.local',
      fullName: 'Sita Ramulu',
      classLevel: 8,
      board: 'Andhra Pradesh State Board',
      medium: 'English',
      academicYear: '2026-2027',
      passwordHash,
      isActive: true,
      avatarUrl: null,
    },
  });

  console.log(`✓ Seeded demo students: ${demoStudent.email} & ${peerStudent.email}`);

  // 3. Subjects for Class 8 (SCERT AP Curriculum: 7 Subjects)
  const class8SubjectsData = [
    { name: 'Mathematics', code: 'MATH08', iconKey: 'calculator', displayOrder: 1 },
    { name: 'Physical Science', code: 'PHY08', iconKey: 'flask', displayOrder: 2 },
    { name: 'Biological Science', code: 'BIO08', iconKey: 'leaf', displayOrder: 3 },
    { name: 'Social Studies', code: 'SOC08', iconKey: 'globe', displayOrder: 4 },
    { name: 'English', code: 'ENG08', iconKey: 'book-open', displayOrder: 5 },
    { name: 'Telugu', code: 'TEL08', iconKey: 'languages', displayOrder: 6 },
    { name: 'Hindi', code: 'HIN08', iconKey: 'feather', displayOrder: 7 },
  ];

  const subjectsMap: Record<string, string> = {};

  for (const sub of class8SubjectsData) {
    const record = await prisma.subject.upsert({
      where: {
        code_classLevel_board_academicYear_medium: {
          code: sub.code,
          classLevel: 8,
          board: 'Andhra Pradesh State Board',
          academicYear: '2026-2027',
          medium: 'English',
        },
      },
      update: {
        name: sub.name,
        iconKey: sub.iconKey,
        displayOrder: sub.displayOrder,
        isActive: true,
      },
      create: {
        name: sub.name,
        code: sub.code,
        iconKey: sub.iconKey,
        displayOrder: sub.displayOrder,
        classLevel: 8,
        board: 'Andhra Pradesh State Board',
        academicYear: '2026-2027',
        medium: 'English',
        isActive: true,
      },
    });
    subjectsMap[sub.code] = record.id;
  }

  // Also seed Class 7 subjects (for curriculum filtering verification)
  const class7SubjectsData = [
    { name: 'Mathematics', code: 'MATH07', iconKey: 'calculator', displayOrder: 1 },
    { name: 'General Science', code: 'SCI07', iconKey: 'atom', displayOrder: 2 },
    { name: 'Social Studies', code: 'SOC07', iconKey: 'globe', displayOrder: 3 },
    { name: 'English', code: 'ENG07', iconKey: 'book-open', displayOrder: 4 },
    { name: 'Telugu', code: 'TEL07', iconKey: 'languages', displayOrder: 5 },
    { name: 'Hindi', code: 'HIN07', iconKey: 'feather', displayOrder: 6 },
  ];

  for (const sub of class7SubjectsData) {
    await prisma.subject.upsert({
      where: {
        code_classLevel_board_academicYear_medium: {
          code: sub.code,
          classLevel: 7,
          board: 'Andhra Pradesh State Board',
          academicYear: '2026-2027',
          medium: 'English',
        },
      },
      update: {
        name: sub.name,
        iconKey: sub.iconKey,
        displayOrder: sub.displayOrder,
        isActive: true,
      },
      create: {
        name: sub.name,
        code: sub.code,
        iconKey: sub.iconKey,
        displayOrder: sub.displayOrder,
        classLevel: 7,
        board: 'Andhra Pradesh State Board',
        academicYear: '2026-2027',
        medium: 'English',
        isActive: true,
      },
    });
  }

  console.log('✓ Seeded subjects for Class 7 and Class 8');

  // 4. Learning Items for Class 8
  const mathId = subjectsMap['MATH08'];
  const phyId = subjectsMap['PHY08'];
  const bioId = subjectsMap['BIO08'];

  // Math Chapter 1 & Lessons
  const mathCh1 = await prisma.learningItem.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      title: 'Chapter 1: Rational Numbers',
      contentType: ContentType.CHAPTER,
      subjectId: mathId,
      displayOrder: 1,
      isPublished: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Chapter 1: Rational Numbers',
      description: 'Understanding properties, closure, and operations on rational numbers.',
      contentType: ContentType.CHAPTER,
      subjectId: mathId,
      displayOrder: 1,
      isPublished: true,
    },
  });

  const mathLesson1 = await prisma.learningItem.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {
      title: '1.1 Properties of Rational Numbers',
      contentType: ContentType.LESSON,
      parentId: mathCh1.id,
      subjectId: mathId,
      displayOrder: 1,
      isPublished: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      title: '1.1 Properties of Rational Numbers',
      description: 'Closure, commutativity, and associativity under addition and multiplication.',
      contentType: ContentType.LESSON,
      parentId: mathCh1.id,
      subjectId: mathId,
      displayOrder: 1,
      isPublished: true,
    },
  });

  const mathLesson2 = await prisma.learningItem.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {
      title: '1.2 Representation on Number Line',
      contentType: ContentType.LESSON,
      parentId: mathCh1.id,
      subjectId: mathId,
      displayOrder: 2,
      isPublished: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      title: '1.2 Representation on Number Line',
      description: 'Plotting rational numbers and finding numbers between two given rational numbers.',
      contentType: ContentType.LESSON,
      parentId: mathCh1.id,
      subjectId: mathId,
      displayOrder: 2,
      isPublished: true,
    },
  });

  // Physical Science Chapter 1 & Lesson
  const phyCh1 = await prisma.learningItem.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {
      title: 'Chapter 1: Force',
      contentType: ContentType.CHAPTER,
      subjectId: phyId,
      displayOrder: 1,
      isPublished: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      title: 'Chapter 1: Force',
      description: 'Concept of push, pull, contact and non-contact forces.',
      contentType: ContentType.CHAPTER,
      subjectId: phyId,
      displayOrder: 1,
      isPublished: true,
    },
  });

  const phyLesson1 = await prisma.learningItem.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {
      title: '1.1 Contact and Non-Contact Forces',
      contentType: ContentType.LESSON,
      parentId: phyCh1.id,
      subjectId: phyId,
      displayOrder: 1,
      isPublished: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      title: '1.1 Contact and Non-Contact Forces',
      description: 'Muscular, frictional, magnetic, and gravitational forces in daily life.',
      contentType: ContentType.LESSON,
      parentId: phyCh1.id,
      subjectId: phyId,
      displayOrder: 1,
      isPublished: true,
    },
  });

  // Biological Science Chapter 1 & Lesson
  const bioCh1 = await prisma.learningItem.upsert({
    where: { id: '00000000-0000-0000-0000-000000000006' },
    update: {
      title: 'Chapter 1: Cell - The Basic Unit of Life',
      contentType: ContentType.CHAPTER,
      subjectId: bioId,
      displayOrder: 1,
      isPublished: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000006',
      title: 'Chapter 1: Cell - The Basic Unit of Life',
      description: 'Discovery of cell, onion peel experiment, and plant vs animal cells.',
      contentType: ContentType.CHAPTER,
      subjectId: bioId,
      displayOrder: 1,
      isPublished: true,
    },
  });

  const bioLesson1 = await prisma.learningItem.upsert({
    where: { id: '00000000-0000-0000-0000-000000000007' },
    update: {
      title: '1.1 Parts of the Cell',
      contentType: ContentType.LESSON,
      parentId: bioCh1.id,
      subjectId: bioId,
      displayOrder: 1,
      isPublished: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000007',
      title: '1.1 Parts of the Cell',
      description: 'Cell membrane, cytoplasm, nucleus, and cell organelles.',
      contentType: ContentType.LESSON,
      parentId: bioCh1.id,
      subjectId: bioId,
      displayOrder: 1,
      isPublished: true,
    },
  });

  console.log('✓ Seeded chapters and lessons for Math, Physical Science, and Bio');

  // 5. Student Learning Progress (Demo Student)
  // Math Lesson 1: 100% completed
  await prisma.studentLearningProgress.upsert({
    where: {
      studentId_learningItemId: {
        studentId: demoStudent.id,
        learningItemId: mathLesson1.id,
      },
    },
    update: {
      progressPercent: 100,
      lastPosition: 'summary-quiz',
      completedAt: new Date(Date.now() - 24 * 3600 * 1000),
      lastAccessedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    create: {
      studentId: demoStudent.id,
      learningItemId: mathLesson1.id,
      progressPercent: 100,
      lastPosition: 'summary-quiz',
      completedAt: new Date(Date.now() - 24 * 3600 * 1000),
      lastAccessedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
  });

  // Math Lesson 2: 65% progress (most recently accessed -> Continue Learning Item!)
  await prisma.studentLearningProgress.upsert({
    where: {
      studentId_learningItemId: {
        studentId: demoStudent.id,
        learningItemId: mathLesson2.id,
      },
    },
    update: {
      progressPercent: 65,
      lastPosition: 'section-2-number-line',
      completedAt: null,
      lastAccessedAt: new Date(),
    },
    create: {
      studentId: demoStudent.id,
      learningItemId: mathLesson2.id,
      progressPercent: 65,
      lastPosition: 'section-2-number-line',
      completedAt: null,
      lastAccessedAt: new Date(),
    },
  });

  // Physical Science Lesson 1: 30% progress
  await prisma.studentLearningProgress.upsert({
    where: {
      studentId_learningItemId: {
        studentId: demoStudent.id,
        learningItemId: phyLesson1.id,
      },
    },
    update: {
      progressPercent: 30,
      lastPosition: 'friction-examples',
      completedAt: null,
      lastAccessedAt: new Date(Date.now() - 48 * 3600 * 1000),
    },
    create: {
      studentId: demoStudent.id,
      learningItemId: phyLesson1.id,
      progressPercent: 30,
      lastPosition: 'friction-examples',
      completedAt: null,
      lastAccessedAt: new Date(Date.now() - 48 * 3600 * 1000),
    },
  });

  console.log('✓ Seeded student learning progress');

  // 6. Learning Tasks & Student Tasks
  const now = new Date();
  const todayDue = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
  const tomorrowDue = new Date(now.getTime() + 24 * 3600 * 1000);
  const upcomingDue = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
  const pastDue = new Date(now.getTime() - 2 * 24 * 3600 * 1000);

  // Task 1: Due Today
  const task1 = await prisma.learningTask.upsert({
    where: { id: '10000000-0000-0000-0000-000000000001' },
    update: {
      title: 'Force and Pressure Concept Review',
      subjectId: phyId,
      taskType: TaskType.ASSIGNMENT,
      dueAt: todayDue,
      classLevel: 8,
      academicYear: '2026-2027',
      status: TaskPublicationStatus.PUBLISHED,
    },
    create: {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Force and Pressure Concept Review',
      description: 'Complete the short-answer questions on friction and atmospheric pressure.',
      subjectId: phyId,
      taskType: TaskType.ASSIGNMENT,
      dueAt: todayDue,
      classLevel: 8,
      academicYear: '2026-2027',
      status: TaskPublicationStatus.PUBLISHED,
    },
  });

  await prisma.studentTask.upsert({
    where: {
      studentId_taskId: {
        studentId: demoStudent.id,
        taskId: task1.id,
      },
    },
    update: {
      status: StudentTaskStatus.IN_PROGRESS,
      startedAt: new Date(now.getTime() - 3600 * 1000),
    },
    create: {
      studentId: demoStudent.id,
      taskId: task1.id,
      status: StudentTaskStatus.IN_PROGRESS,
      startedAt: new Date(now.getTime() - 3600 * 1000),
    },
  });

  // Task 2: Due Tomorrow (Quiz)
  const task2 = await prisma.learningTask.upsert({
    where: { id: '10000000-0000-0000-0000-000000000002' },
    update: {
      title: 'Rational Numbers Diagnostic Quiz',
      subjectId: mathId,
      taskType: TaskType.QUIZ,
      dueAt: tomorrowDue,
      classLevel: 8,
      academicYear: '2026-2027',
      status: TaskPublicationStatus.PUBLISHED,
    },
    create: {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Rational Numbers Diagnostic Quiz',
      description: '10 multiple-choice questions assessing closure and associative properties.',
      subjectId: mathId,
      taskType: TaskType.QUIZ,
      dueAt: tomorrowDue,
      classLevel: 8,
      academicYear: '2026-2027',
      status: TaskPublicationStatus.PUBLISHED,
    },
  });

  await prisma.studentTask.upsert({
    where: {
      studentId_taskId: {
        studentId: demoStudent.id,
        taskId: task2.id,
      },
    },
    update: {
      status: StudentTaskStatus.PENDING,
    },
    create: {
      studentId: demoStudent.id,
      taskId: task2.id,
      status: StudentTaskStatus.PENDING,
    },
  });

  // Task 3: Upcoming Homework (Cell Structure)
  const task3 = await prisma.learningTask.upsert({
    where: { id: '10000000-0000-0000-0000-000000000003' },
    update: {
      title: 'Plant and Animal Cell Comparison Diagram',
      subjectId: bioId,
      taskType: TaskType.HOMEWORK,
      dueAt: upcomingDue,
      classLevel: 8,
      academicYear: '2026-2027',
      status: TaskPublicationStatus.PUBLISHED,
    },
    create: {
      id: '10000000-0000-0000-0000-000000000003',
      title: 'Plant and Animal Cell Comparison Diagram',
      description: 'Draw and label the cell membrane, nucleus, vacuoles, and chloroplast.',
      subjectId: bioId,
      taskType: TaskType.HOMEWORK,
      dueAt: upcomingDue,
      classLevel: 8,
      academicYear: '2026-2027',
      status: TaskPublicationStatus.PUBLISHED,
    },
  });

  await prisma.studentTask.upsert({
    where: {
      studentId_taskId: {
        studentId: demoStudent.id,
        taskId: task3.id,
      },
    },
    update: {
      status: StudentTaskStatus.PENDING,
    },
    create: {
      studentId: demoStudent.id,
      taskId: task3.id,
      status: StudentTaskStatus.PENDING,
    },
  });

  // Task 4: Completed Quiz with Score
  const task4 = await prisma.learningTask.upsert({
    where: { id: '10000000-0000-0000-0000-000000000004' },
    update: {
      title: 'Number Systems Introductory Test',
      subjectId: mathId,
      taskType: TaskType.QUIZ,
      dueAt: new Date(now.getTime() - 24 * 3600 * 1000),
      classLevel: 8,
      academicYear: '2026-2027',
      status: TaskPublicationStatus.PUBLISHED,
    },
    create: {
      id: '10000000-0000-0000-0000-000000000004',
      title: 'Number Systems Introductory Test',
      description: 'Self-assessment quiz on natural, whole numbers, and integers.',
      subjectId: mathId,
      taskType: TaskType.QUIZ,
      dueAt: new Date(now.getTime() - 24 * 3600 * 1000),
      classLevel: 8,
      academicYear: '2026-2027',
      status: TaskPublicationStatus.PUBLISHED,
    },
  });

  await prisma.studentTask.upsert({
    where: {
      studentId_taskId: {
        studentId: demoStudent.id,
        taskId: task4.id,
      },
    },
    update: {
      status: StudentTaskStatus.COMPLETED,
      completedAt: new Date(now.getTime() - 24 * 3600 * 1000),
      score: 90.0,
      feedback: 'Excellent work on integer operations!',
    },
    create: {
      studentId: demoStudent.id,
      taskId: task4.id,
      status: StudentTaskStatus.COMPLETED,
      completedAt: new Date(now.getTime() - 24 * 3600 * 1000),
      score: 90.0,
      feedback: 'Excellent work on integer operations!',
    },
  });

  // Task 5: Overdue Task
  const task5 = await prisma.learningTask.upsert({
    where: { id: '10000000-0000-0000-0000-000000000005' },
    update: {
      title: 'Social Studies Maps Practice 1',
      subjectId: subjectsMap['SOC08'],
      taskType: TaskType.HOMEWORK,
      dueAt: pastDue,
      classLevel: 8,
      academicYear: '2026-2027',
      status: TaskPublicationStatus.PUBLISHED,
    },
    create: {
      id: '10000000-0000-0000-0000-000000000005',
      title: 'Social Studies Maps Practice 1',
      description: 'Locate the major river basins of Andhra Pradesh on the outline map.',
      subjectId: subjectsMap['SOC08'],
      taskType: TaskType.HOMEWORK,
      dueAt: pastDue,
      classLevel: 8,
      academicYear: '2026-2027',
      status: TaskPublicationStatus.PUBLISHED,
    },
  });

  await prisma.studentTask.upsert({
    where: {
      studentId_taskId: {
        studentId: demoStudent.id,
        taskId: task5.id,
      },
    },
    update: {
      status: StudentTaskStatus.PENDING, // Overdue will be calculated dynamically or marked
    },
    create: {
      studentId: demoStudent.id,
      taskId: task5.id,
      status: StudentTaskStatus.PENDING,
    },
  });

  console.log('✓ Seeded learning tasks and student task states');

  // 7. Announcements
  const ann1 = await prisma.announcement.upsert({
    where: { id: '20000000-0000-0000-0000-000000000001' },
    update: {
      title: 'SCERT Andhra Pradesh Academic Calendar 2026-2027 Released',
      message: 'The annual curriculum planner and formative assessment schedule is now available.',
      audienceType: AudienceType.ALL_STUDENTS,
      classLevel: null,
      academicYear: '2026-2027',
      publishedAt: new Date(now.getTime() - 48 * 3600 * 1000),
      isPublished: true,
    },
    create: {
      id: '20000000-0000-0000-0000-000000000001',
      title: 'SCERT Andhra Pradesh Academic Calendar 2026-2027 Released',
      message: 'The annual curriculum planner and formative assessment schedule is now available.',
      audienceType: AudienceType.ALL_STUDENTS,
      classLevel: null,
      academicYear: '2026-2027',
      publishedAt: new Date(now.getTime() - 48 * 3600 * 1000),
      isPublished: true,
    },
  });

  const ann2 = await prisma.announcement.upsert({
    where: { id: '20000000-0000-0000-0000-000000000002' },
    update: {
      title: 'Class 8 Science Exhibition Preparation',
      message: 'All students are invited to register working models for the district science fair.',
      audienceType: AudienceType.CLASS,
      classLevel: 8,
      academicYear: '2026-2027',
      publishedAt: new Date(now.getTime() - 2 * 3600 * 1000),
      isPublished: true,
    },
    create: {
      id: '20000000-0000-0000-0000-000000000002',
      title: 'Class 8 Science Exhibition Preparation',
      message: 'All students are invited to register working models for the district science fair.',
      audienceType: AudienceType.CLASS,
      classLevel: 8,
      academicYear: '2026-2027',
      publishedAt: new Date(now.getTime() - 2 * 3600 * 1000),
      isPublished: true,
    },
  });

  // Class 10 announcement (should NOT be visible to student 1)
  await prisma.announcement.upsert({
    where: { id: '20000000-0000-0000-0000-000000000003' },
    update: {
      title: 'Class 10 SSC Board Examination Hall Tickets Notice',
      message: 'Verification of candidate names and hall ticket registration forms.',
      audienceType: AudienceType.CLASS,
      classLevel: 10,
      academicYear: '2026-2027',
      publishedAt: new Date(),
      isPublished: true,
    },
    create: {
      id: '20000000-0000-0000-0000-000000000003',
      title: 'Class 10 SSC Board Examination Hall Tickets Notice',
      message: 'Verification of candidate names and hall ticket registration forms.',
      audienceType: AudienceType.CLASS,
      classLevel: 10,
      academicYear: '2026-2027',
      publishedAt: new Date(),
      isPublished: true,
    },
  });

  // Student 1 has read Announcement 1, but not Announcement 2
  await prisma.announcementRead.upsert({
    where: {
      announcementId_studentId: {
        announcementId: ann1.id,
        studentId: demoStudent.id,
      },
    },
    update: {
      readAt: new Date(now.getTime() - 20 * 3600 * 1000),
    },
    create: {
      announcementId: ann1.id,
      studentId: demoStudent.id,
      readAt: new Date(now.getTime() - 20 * 3600 * 1000),
    },
  });

  console.log('✓ Seeded announcements and read states');

  // 8. Bookmarks
  await prisma.bookmark.upsert({
    where: {
      studentId_learningItemId: {
        studentId: demoStudent.id,
        learningItemId: mathLesson1.id,
      },
    },
    update: {},
    create: {
      studentId: demoStudent.id,
      learningItemId: mathLesson1.id,
    },
  });

  console.log('✓ Seeded bookmarks');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

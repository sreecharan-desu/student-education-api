import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskPeriodFilter, TaskStatusFilter } from './dto/task-query.dto';
import { TaskType, TaskPublicationStatus, StudentTaskStatus } from '@prisma/client';

describe('TasksService', () => {
  let tasksService: TasksService;
  let prismaService: PrismaService;

  const mockStudent = {
    id: 'student-uuid-1',
    email: 'student@vidya.local',
    fullName: 'Aditya Varma',
    classLevel: 8,
    board: 'Andhra Pradesh State Board',
    medium: 'English',
    academicYear: '2026-2027',
    avatarUrl: null,
  };

  const now = new Date();
  const pastDate = new Date(now.getTime() - 2 * 24 * 3600 * 1000);
  const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 15, 0, 0));
  const futureDate = new Date(now.getTime() + 5 * 24 * 3600 * 1000);

  const mockTasks = [
    {
      id: 'task-1-overdue',
      title: 'Overdue Assignment',
      description: 'Map assignment',
      taskType: TaskType.HOMEWORK,
      subjectId: 'sub-1',
      classLevel: 8,
      academicYear: '2026-2027',
      dueAt: pastDate,
      availableFrom: null,
      status: TaskPublicationStatus.PUBLISHED,
      createdAt: pastDate,
      updatedAt: pastDate,
      subject: { id: 'sub-1', name: 'Social Studies', code: 'SOC08', iconKey: 'globe' },
      studentTasks: [
        {
          id: 'st-1',
          status: StudentTaskStatus.PENDING,
          score: null,
          feedback: null,
          completedAt: null,
        },
      ],
    },
    {
      id: 'task-2-today',
      title: 'Due Today Assignment',
      description: 'Physics review',
      taskType: TaskType.ASSIGNMENT,
      subjectId: 'sub-2',
      classLevel: 8,
      academicYear: '2026-2027',
      dueAt: todayDate,
      availableFrom: null,
      status: TaskPublicationStatus.PUBLISHED,
      createdAt: now,
      updatedAt: now,
      subject: { id: 'sub-2', name: 'Physical Science', code: 'PHY08', iconKey: 'flask' },
      studentTasks: [
        {
          id: 'st-2',
          status: StudentTaskStatus.IN_PROGRESS,
          score: null,
          feedback: null,
          completedAt: null,
        },
      ],
    },
    {
      id: 'task-3-completed',
      title: 'Completed Quiz',
      description: 'Math introductory test',
      taskType: TaskType.QUIZ,
      subjectId: 'sub-3',
      classLevel: 8,
      academicYear: '2026-2027',
      dueAt: pastDate,
      availableFrom: null,
      status: TaskPublicationStatus.PUBLISHED,
      createdAt: pastDate,
      updatedAt: now,
      subject: { id: 'sub-3', name: 'Mathematics', code: 'MATH08', iconKey: 'calculator' },
      studentTasks: [
        {
          id: 'st-3',
          status: StudentTaskStatus.COMPLETED,
          score: 95.0,
          feedback: 'Great!',
          completedAt: now,
        },
      ],
    },
    {
      id: 'task-4-upcoming',
      title: 'Future Biology Task',
      description: 'Cell diagram',
      taskType: TaskType.HOMEWORK,
      subjectId: 'sub-4',
      classLevel: 8,
      academicYear: '2026-2027',
      dueAt: futureDate,
      availableFrom: null,
      status: TaskPublicationStatus.PUBLISHED,
      createdAt: now,
      updatedAt: now,
      subject: { id: 'sub-4', name: 'Biological Science', code: 'BIO08', iconKey: 'leaf' },
      studentTasks: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            learningTask: {
              findMany: jest.fn().mockResolvedValue(mockTasks),
            },
          },
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });

  it('should correctly derive OVERDUE status for tasks with past due dates that are not completed', async () => {
    const result = await tasksService.getTasksForStudent(mockStudent, { period: TaskPeriodFilter.ALL, limit: 10 });
    const overdueTask = result.tasks.find((t) => t.id === 'task-1-overdue');

    expect(overdueTask).toBeDefined();
    expect(overdueTask?.status).toBe('OVERDUE');
    expect(overdueTask?.isOverdue).toBe(true);
  });

  it('should not mark a completed task as overdue even if its due date was in the past', async () => {
    const result = await tasksService.getTasksForStudent(mockStudent, { period: TaskPeriodFilter.ALL, limit: 10 });
    const completedTask = result.tasks.find((t) => t.id === 'task-3-completed');

    expect(completedTask).toBeDefined();
    expect(completedTask?.status).toBe('COMPLETED');
    expect(completedTask?.isOverdue).toBe(false);
  });

  it('should filter tasks due today when period=today is passed', async () => {
    const result = await tasksService.getTasksForStudent(mockStudent, { period: TaskPeriodFilter.TODAY, limit: 10 });
    expect(result.tasks.every((t) => t.id === 'task-2-today')).toBe(true);
  });

  it('should sort urgent incomplete tasks first (overdue, then earliest due) and completed last', async () => {
    const result = await tasksService.getTasksForStudent(mockStudent, { period: TaskPeriodFilter.ALL, limit: 10 });
    const taskIds = result.tasks.map((t) => t.id);

    // Overdue task should be first
    expect(taskIds[0]).toBe('task-1-overdue');
    // Completed task should be last
    expect(taskIds[taskIds.length - 1]).toBe('task-3-completed');
  });
});

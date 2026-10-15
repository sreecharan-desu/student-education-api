import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SubjectsService', () => {
  let subjectsService: SubjectsService;
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

  const mockDbSubjects = [
    {
      id: 'sub-math-8',
      name: 'Mathematics',
      code: 'MATH08',
      iconKey: 'calculator',
      displayOrder: 1,
      classLevel: 8,
      board: 'Andhra Pradesh State Board',
      medium: 'English',
      academicYear: '2026-2027',
      isActive: true,
      learningItems: [
        {
          id: 'item-1',
          contentType: 'LESSON',
          studentProgress: [{ id: 'p-1', progressPercent: 100 }],
        },
        {
          id: 'item-2',
          contentType: 'LESSON',
          studentProgress: [],
        },
      ],
    },
    {
      id: 'sub-telugu-8',
      name: 'Telugu',
      code: 'TEL08',
      iconKey: 'languages',
      displayOrder: 6,
      classLevel: 8,
      board: 'Andhra Pradesh State Board',
      medium: 'English',
      academicYear: '2026-2027',
      isActive: true,
      learningItems: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: PrismaService,
          useValue: {
            subject: {
              findMany: jest.fn().mockResolvedValue(mockDbSubjects),
            },
          },
        },
      ],
    }).compile();

    subjectsService = module.get<SubjectsService>(SubjectsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(subjectsService).toBeDefined();
  });

  it('should compute completed items, total items, and progress percentage correctly', async () => {
    const result = await subjectsService.getSubjectsForStudent(mockStudent);

    const math = result.find((s) => s.code === 'MATH08');
    expect(math).toBeDefined();
    expect(math?.totalItems).toBe(2);
    expect(math?.completedItems).toBe(1);
    expect(math?.progressPercent).toBe(50.0);

    const telugu = result.find((s) => s.code === 'TEL08');
    expect(telugu).toBeDefined();
    expect(telugu?.totalItems).toBe(0);
    expect(telugu?.completedItems).toBe(0);
    // When 0 items exist, progressPercent should be null, not NaN or fabricated number
    expect(telugu?.progressPercent).toBeNull();
  });
});

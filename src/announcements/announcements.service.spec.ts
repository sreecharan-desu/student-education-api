import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';
import { AudienceType } from '@prisma/client';

describe('AnnouncementsService', () => {
  let announcementsService: AnnouncementsService;
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

  const mockDbAnnouncements = [
    {
      id: 'ann-1',
      title: 'State Board Calendar',
      message: 'Calendar announced',
      audienceType: AudienceType.ALL_STUDENTS,
      classLevel: null,
      academicYear: '2026-2027',
      publishedAt: new Date(),
      expiresAt: null,
      isPublished: true,
      reads: [{ readAt: new Date() }],
    },
    {
      id: 'ann-2',
      title: 'Class 8 Fair',
      message: 'Science fair for class 8',
      audienceType: AudienceType.CLASS,
      classLevel: 8,
      academicYear: '2026-2027',
      publishedAt: new Date(),
      expiresAt: null,
      isPublished: true,
      reads: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        {
          provide: PrismaService,
          useValue: {
            announcement: {
              findMany: jest.fn().mockResolvedValue(mockDbAnnouncements),
              findUnique: jest.fn(),
            },
            announcementRead: {
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    announcementsService = module.get<AnnouncementsService>(AnnouncementsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(announcementsService).toBeDefined();
  });

  it('should return announcements and correctly indicate read/unread status', async () => {
    const result = await announcementsService.getAnnouncementsForStudent(mockStudent);

    expect(result).toHaveLength(2);
    expect(result[0].isRead).toBe(true);
    expect(result[0].readAt).not.toBeNull();

    expect(result[1].isRead).toBe(false);
    expect(result[1].readAt).toBeNull();
  });

  it('should idempotently mark an announcement as read', async () => {
    const now = new Date();
    jest.spyOn(prismaService.announcement, 'findUnique').mockResolvedValue({
      id: 'ann-2',
      isPublished: true,
    } as any);

    jest.spyOn(prismaService.announcementRead, 'upsert').mockResolvedValue({
      id: 'read-uuid',
      announcementId: 'ann-2',
      studentId: mockStudent.id,
      readAt: now,
    } as any);

    const res = await announcementsService.markAsRead('ann-2', mockStudent);

    expect(res.success).toBe(true);
    expect(res.announcementId).toBe('ann-2');
    expect(res.readAt).toBe(now.toISOString());
  });

  it('should throw NotFoundException if announcement does not exist or is unpublished', async () => {
    jest.spyOn(prismaService.announcement, 'findUnique').mockResolvedValue(null);

    await expect(announcementsService.markAsRead('nonexistent-id', mockStudent)).rejects.toThrow(
      NotFoundException,
    );
  });
});

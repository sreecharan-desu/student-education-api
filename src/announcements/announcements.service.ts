import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedStudent } from '../auth/interfaces/authenticated-student.interface';
import { AnnouncementItemDto, MarkAnnouncementReadResponseDto } from './dto/announcement-response.dto';
import { AudienceType } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnnouncementsForStudent(
    student: AuthenticatedStudent,
    limit: number = 10,
  ): Promise<AnnouncementItemDto[]> {
    const now = new Date();

    const announcements = await this.prisma.announcement.findMany({
      where: {
        academicYear: student.academicYear,
        isPublished: true,
        OR: [
          { audienceType: AudienceType.ALL_STUDENTS },
          { audienceType: AudienceType.CLASS, classLevel: student.classLevel },
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          },
        ],
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: Math.min(limit, 50),
      include: {
        reads: {
          where: { studentId: student.id },
          select: { readAt: true },
        },
      },
    });

    return announcements.map((ann) => {
      const readRecord = ann.reads[0];
      return {
        id: ann.id,
        title: ann.title,
        message: ann.message,
        audienceType: ann.audienceType,
        classLevel: ann.classLevel,
        academicYear: ann.academicYear,
        publishedAt: ann.publishedAt.toISOString(),
        expiresAt: ann.expiresAt ? ann.expiresAt.toISOString() : null,
        isRead: Boolean(readRecord),
        readAt: readRecord?.readAt ? readRecord.readAt.toISOString() : null,
      };
    });
  }

  async markAsRead(
    announcementId: string,
    student: AuthenticatedStudent,
  ): Promise<MarkAnnouncementReadResponseDto> {
    // 1. Verify announcement exists and is published
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement || !announcement.isPublished) {
      throw new NotFoundException('Announcement not found or not published');
    }

    // 2. Idempotent upsert so duplicate requests do not create errors or duplicate records
    const readRecord = await this.prisma.announcementRead.upsert({
      where: {
        announcementId_studentId: {
          announcementId,
          studentId: student.id,
        },
      },
      update: {},
      create: {
        announcementId,
        studentId: student.id,
      },
    });

    return {
      success: true,
      announcementId,
      readAt: readRecord.readAt.toISOString(),
    };
  }
}

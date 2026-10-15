import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedStudent } from '../auth/interfaces/authenticated-student.interface';
import { SubjectItemDto } from './dto/subject-response.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubjectsForStudent(student: AuthenticatedStudent): Promise<SubjectItemDto[]> {
    // Single query retrieving subjects for the student's exact class, board, academicYear, and medium
    const subjects = await this.prisma.subject.findMany({
      where: {
        classLevel: student.classLevel,
        board: student.board,
        academicYear: student.academicYear,
        isActive: true,
        ...(student.medium ? { medium: student.medium } : {}),
      },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        learningItems: {
          where: { isPublished: true },
          select: {
            id: true,
            contentType: true,
            studentProgress: {
              where: {
                studentId: student.id,
                completedAt: { not: null },
              },
              select: {
                id: true,
                progressPercent: true,
              },
            },
          },
        },
      },
    });

    return subjects.map((sub) => {
      // Count only published lessons/items
      const totalItems = sub.learningItems.length;
      let completedItems = 0;

      for (const item of sub.learningItems) {
        if (item.studentProgress && item.studentProgress.length > 0) {
          completedItems++;
        }
      }

      const progressPercent =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 1000) / 10 : null;

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        iconKey: sub.iconKey,
        displayOrder: sub.displayOrder,
        classLevel: sub.classLevel,
        board: sub.board,
        medium: sub.medium,
        academicYear: sub.academicYear,
        completedItems,
        totalItems,
        progressPercent,
      };
    });
  }
}

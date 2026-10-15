import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedStudent } from '../auth/interfaces/authenticated-student.interface';
import { ContinueLearningDto } from './dto/continue-learning-response.dto';

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

  async getContinueLearningForStudent(
    student: AuthenticatedStudent,
  ): Promise<ContinueLearningDto | null> {
    // Find the student's most recently accessed learning progress for published items matching curriculum
    const recentProgress = await this.prisma.studentLearningProgress.findFirst({
      where: {
        studentId: student.id,
        progressPercent: { lt: 100 }, // prioritize incomplete items to continue
        learningItem: {
          isPublished: true,
          subject: {
            classLevel: student.classLevel,
            board: student.board,
            academicYear: student.academicYear,
            isActive: true,
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
      include: {
        learningItem: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                iconKey: true,
              },
            },
            parent: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // If no incomplete item is found, fallback to any most recently accessed item
    if (!recentProgress) {
      const anyProgress = await this.prisma.studentLearningProgress.findFirst({
        where: {
          studentId: student.id,
          learningItem: {
            isPublished: true,
            subject: {
              classLevel: student.classLevel,
              board: student.board,
              academicYear: student.academicYear,
              isActive: true,
            },
          },
        },
        orderBy: {
          lastAccessedAt: 'desc',
        },
        include: {
          learningItem: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  iconKey: true,
                },
              },
              parent: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      if (!anyProgress) {
        return null;
      }

      return {
        learningItemId: anyProgress.learningItemId,
        title: anyProgress.learningItem.title,
        contentType: anyProgress.learningItem.contentType,
        subject: anyProgress.learningItem.subject,
        chapterTitle: anyProgress.learningItem.parent?.title ?? null,
        progressPercent: anyProgress.progressPercent,
        lastPosition: anyProgress.lastPosition,
        lastAccessedAt: anyProgress.lastAccessedAt.toISOString(),
      };
    }

    return {
      learningItemId: recentProgress.learningItemId,
      title: recentProgress.learningItem.title,
      contentType: recentProgress.learningItem.contentType,
      subject: recentProgress.learningItem.subject,
      chapterTitle: recentProgress.learningItem.parent?.title ?? null,
      progressPercent: recentProgress.progressPercent,
      lastPosition: recentProgress.lastPosition,
      lastAccessedAt: recentProgress.lastAccessedAt.toISOString(),
    };
  }
}

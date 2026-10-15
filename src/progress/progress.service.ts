import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedStudent } from '../auth/interfaces/authenticated-student.interface';
import { ProgressResponseDto, DailyActivityDto, SubjectProgressSummaryDto } from './dto/progress-response.dto';
import { TaskType, StudentTaskStatus, ContentType } from '@prisma/client';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgressForStudent(student: AuthenticatedStudent): Promise<ProgressResponseDto> {
    // 1. Completed Lessons Count (published lessons matching student curriculum)
    const completedLessons = await this.prisma.studentLearningProgress.count({
      where: {
        studentId: student.id,
        completedAt: { not: null },
        learningItem: {
          isPublished: true,
          contentType: ContentType.LESSON,
          subject: {
            classLevel: student.classLevel,
            board: student.board,
            academicYear: student.academicYear,
            isActive: true,
          },
        },
      },
    });

    // 2. Completed Tasks Count
    const completedTasks = await this.prisma.studentTask.count({
      where: {
        studentId: student.id,
        status: StudentTaskStatus.COMPLETED,
        task: {
          classLevel: student.classLevel,
          academicYear: student.academicYear,
        },
      },
    });

    // 3. Average Quiz Score
    const scoredQuizzes = await this.prisma.studentTask.findMany({
      where: {
        studentId: student.id,
        score: { not: null },
        task: {
          taskType: TaskType.QUIZ,
          classLevel: student.classLevel,
          academicYear: student.academicYear,
        },
      },
      select: {
        score: true,
      },
    });

    let averageQuizScore: number | null = null;
    if (scoredQuizzes.length > 0) {
      const sum = scoredQuizzes.reduce((acc, curr) => acc + (curr.score ?? 0), 0);
      averageQuizScore = Math.round((sum / scoredQuizzes.length) * 10) / 10;
    }

    // 4. Trailing 7 Days Weekly Activity
    const weeklyActivity: DailyActivityDto[] = [];
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0));
      const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));

      const [completedLessonsDay, completedTasksDay] = await Promise.all([
        this.prisma.studentLearningProgress.count({
          where: {
            studentId: student.id,
            completedAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        this.prisma.studentTask.count({
          where: {
            studentId: student.id,
            status: StudentTaskStatus.COMPLETED,
            completedAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
      ]);

      const dateStr = startOfDay.toISOString().split('T')[0];
      const dayName = dayNames[startOfDay.getUTCDay()];

      weeklyActivity.push({
        day: dayName,
        date: dateStr,
        count: completedLessonsDay + completedTasksDay,
      });
    }

    // 5. Subject-wise Progress
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
            studentProgress: {
              where: {
                studentId: student.id,
                completedAt: { not: null },
              },
              select: { id: true },
            },
          },
        },
      },
    });

    const subjectWiseProgress: SubjectProgressSummaryDto[] = subjects.map((sub) => {
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
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        iconKey: sub.iconKey,
        completedItems,
        totalItems,
        progressPercent,
      };
    });

    return {
      completedLessons,
      completedTasks,
      averageQuizScore,
      weeklyActivity,
      subjectWiseProgress,
    };
  }
}

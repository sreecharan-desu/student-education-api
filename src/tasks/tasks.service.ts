import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedStudent } from '../auth/interfaces/authenticated-student.interface';
import {
  TaskQueryDto,
  TaskPeriodFilter,
  TaskStatusFilter,
} from './dto/task-query.dto';
import { TaskItemDto, TaskListResponseDto } from './dto/task-response.dto';
import { TaskPublicationStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getTasksForStudent(
    student: AuthenticatedStudent,
    query: TaskQueryDto,
  ): Promise<TaskListResponseDto> {
    const now = new Date();

    // Query published learning tasks for student's class and academic year
    const tasks = await this.prisma.learningTask.findMany({
      where: {
        classLevel: student.classLevel,
        academicYear: student.academicYear,
        status: TaskPublicationStatus.PUBLISHED,
        OR: [
          { availableFrom: null },
          { availableFrom: { lte: now } },
        ],
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            iconKey: true,
          },
        },
        studentTasks: {
          where: { studentId: student.id },
          select: {
            id: true,
            status: true,
            score: true,
            feedback: true,
            completedAt: true,
          },
        },
      },
      orderBy: [
        { dueAt: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Compute effective status and map DTOs
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const mappedTasks: TaskItemDto[] = tasks.map((task) => {
      const studentTask = task.studentTasks[0];
      const rawStatus = studentTask ? studentTask.status : 'PENDING';
      const isCompleted = rawStatus === 'COMPLETED';
      const isSubmitted = rawStatus === 'SUBMITTED';

      const isPastDue = Boolean(task.dueAt && new Date(task.dueAt) < now);
      const isOverdue = isPastDue && !isCompleted && !isSubmitted;

      const effectiveStatus = isOverdue ? 'OVERDUE' : rawStatus;

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        taskType: task.taskType,
        subject: {
          id: task.subject.id,
          name: task.subject.name,
          code: task.subject.code,
          iconKey: task.subject.iconKey,
        },
        dueAt: task.dueAt ? task.dueAt.toISOString() : null,
        status: effectiveStatus,
        score: studentTask?.score ?? null,
        feedback: studentTask?.feedback ?? null,
        completedAt: studentTask?.completedAt ? studentTask.completedAt.toISOString() : null,
        isOverdue,
      };
    });

    // Filter by period
    let filtered = mappedTasks;

    if (query.period === TaskPeriodFilter.TODAY) {
      filtered = filtered.filter((t) => {
        if (!t.dueAt) return false;
        const d = new Date(t.dueAt);
        return d >= startOfToday && d <= endOfToday;
      });
    } else if (query.period === TaskPeriodFilter.UPCOMING) {
      filtered = filtered.filter((t) => {
        if (!t.dueAt) return true; // tasks without due dates are treated as upcoming
        const d = new Date(t.dueAt);
        return d > endOfToday;
      });
    }

    // Filter by status
    if (query.status) {
      const targetStatus = query.status.toUpperCase();
      filtered = filtered.filter((t) => t.status === targetStatus);
    }

    // Sort incomplete urgent tasks first, then upcoming, completed last
    filtered.sort((a, b) => {
      const isDoneA = a.status === 'COMPLETED' || a.status === 'SUBMITTED';
      const isDoneB = b.status === 'COMPLETED' || b.status === 'SUBMITTED';

      if (isDoneA !== isDoneB) {
        return isDoneA ? 1 : -1;
      }

      // Overdue tasks take highest priority among incomplete tasks
      if (a.isOverdue !== b.isOverdue) {
        return a.isOverdue ? -1 : 1;
      }

      // If both have due dates, earliest due date first
      if (a.dueAt && b.dueAt) {
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      }
      if (a.dueAt && !b.dueAt) return -1;
      if (!a.dueAt && b.dueAt) return 1;

      return 0;
    });

    // Pagination
    let startIndex = 0;
    if (query.cursor) {
      const cursorIdx = filtered.findIndex((t) => t.id === query.cursor);
      if (cursorIdx !== -1) {
        startIndex = cursorIdx + 1;
      }
    }

    const limit = query.limit || 10;
    const paginated = filtered.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < filtered.length ? paginated[paginated.length - 1]?.id ?? null : null;

    return {
      tasks: paginated,
      total: filtered.length,
      nextCursor,
    };
  }
}

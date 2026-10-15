import { Injectable, Logger } from '@nestjs/common';
import { AuthenticatedStudent } from '../auth/interfaces/authenticated-student.interface';
import { DashboardSummaryDto } from './dto/dashboard-response.dto';
import { SubjectsService } from '../subjects/subjects.service';
import { TasksService } from '../tasks/tasks.service';
import { LearningService } from '../learning/learning.service';
import { ProgressService } from '../progress/progress.service';
import { AnnouncementsService } from '../announcements/announcements.service';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import { TaskQueryDto, TaskPeriodFilter } from '../tasks/dto/task-query.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly tasksService: TasksService,
    private readonly learningService: LearningService,
    private readonly progressService: ProgressService,
    private readonly announcementsService: AnnouncementsService,
    private readonly bookmarksService: BookmarksService,
  ) {}

  async getDashboardSummary(student: AuthenticatedStudent): Promise<DashboardSummaryDto> {
    try {
      // Parallel execution of underlying dashboard components for optimal latency
      const taskQuery: TaskQueryDto = {
        period: TaskPeriodFilter.ALL,
        limit: 5, // Top urgent/upcoming tasks for dashboard card
      };

      const [
        tasksResponse,
        continueLearning,
        subjects,
        progress,
        announcements,
        bookmarksCount,
      ] = await Promise.all([
        this.tasksService.getTasksForStudent(student, taskQuery),
        this.learningService.getContinueLearningForStudent(student),
        this.subjectsService.getSubjectsForStudent(student),
        this.progressService.getProgressForStudent(student),
        this.announcementsService.getAnnouncementsForStudent(student, 5),
        this.bookmarksService.getBookmarksCountForStudent(student.id),
      ]);

      return {
        student: {
          id: student.id,
          email: student.email,
          fullName: student.fullName,
          classLevel: student.classLevel,
          board: student.board,
          medium: student.medium,
          academicYear: student.academicYear,
          avatarUrl: student.avatarUrl,
        },
        tasks: tasksResponse.tasks,
        continueLearning,
        subjects,
        progress,
        announcements,
        quickActions: {
          bookmarksCount,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to assemble dashboard summary for student ${student.id}`, error);
      throw error;
    }
  }
}

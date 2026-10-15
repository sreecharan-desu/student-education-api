import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryDto } from './dto/dashboard-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedStudent } from '../auth/interfaces/authenticated-student.interface';
import { TaskQueryDto } from '../tasks/dto/task-query.dto';
import { TaskListResponseDto } from '../tasks/dto/task-response.dto';
import { TasksService } from '../tasks/tasks.service';
import { SubjectsService } from '../subjects/subjects.service';
import { SubjectItemDto } from '../subjects/dto/subject-response.dto';
import { LearningService } from '../learning/learning.service';
import { ContinueLearningDto } from '../learning/dto/continue-learning-response.dto';
import { ProgressService } from '../progress/progress.service';
import { ProgressResponseDto } from '../progress/dto/progress-response.dto';
import { AnnouncementsService } from '../announcements/announcements.service';
import { AnnouncementItemDto } from '../announcements/dto/announcement-response.dto';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import {
  BookmarkQueryDto,
  BookmarkPreviewResponseDto,
} from '../bookmarks/dto/bookmark-response.dto';

@ApiTags('Student Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly tasksService: TasksService,
    private readonly subjectsService: SubjectsService,
    private readonly learningService: LearningService,
    private readonly progressService: ProgressService,
    private readonly announcementsService: AnnouncementsService,
    private readonly bookmarksService: BookmarksService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Aggregated Student Dashboard',
    description:
      'Returns a single aggregated payload containing student profile, urgent tasks, continue-learning item, available subjects, progress summary, recent announcements, and quick-actions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Aggregated dashboard summary.',
    type: DashboardSummaryDto,
  })
  @ApiResponse({ status: 401, description: 'Missing, invalid, or expired authentication token.' })
  async getDashboardSummary(
    @CurrentUser() student: AuthenticatedStudent,
  ): Promise<DashboardSummaryDto> {
    return this.dashboardService.getDashboardSummary(student);
  }

  @Get('tasks')
  @ApiOperation({
    summary: 'Today and Upcoming Learning Tasks',
    description:
      'Returns learning tasks for the authenticated student with period filtering (today, upcoming, all) and status filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of student learning tasks.',
    type: TaskListResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getTasks(
    @CurrentUser() student: AuthenticatedStudent,
    @Query() query: TaskQueryDto,
  ): Promise<TaskListResponseDto> {
    return this.tasksService.getTasksForStudent(student, query);
  }

  @Get('subjects')
  @ApiOperation({
    summary: 'Curriculum Subjects & Progress',
    description:
      'Returns subjects configured for the authenticated student class level, board, and academic year with progress percentages.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of subjects with progress metrics.',
    type: [SubjectItemDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSubjects(
    @CurrentUser() student: AuthenticatedStudent,
  ): Promise<SubjectItemDto[]> {
    return this.subjectsService.getSubjectsForStudent(student);
  }

  @Get('continue-learning')
  @ApiOperation({
    summary: 'Continue Learning Item',
    description:
      'Returns the most recently accessed eligible learning item to allow resuming study from where the student left off.',
  })
  @ApiResponse({
    status: 200,
    description: 'Most recently accessed learning item, or null if no eligible progress exists.',
    type: ContinueLearningDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getContinueLearning(
    @CurrentUser() student: AuthenticatedStudent,
  ): Promise<ContinueLearningDto | null> {
    return this.learningService.getContinueLearningForStudent(student);
  }

  @Get('progress')
  @ApiOperation({
    summary: 'Learning Progress & Analytics',
    description:
      'Returns overall metrics, completed lessons, completed tasks, quiz performance average, and weekly activity.',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress and activity metrics.',
    type: ProgressResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProgress(
    @CurrentUser() student: AuthenticatedStudent,
  ): Promise<ProgressResponseDto> {
    return this.progressService.getProgressForStudent(student);
  }

  @Get('announcements')
  @ApiOperation({
    summary: 'Recent Announcements',
    description:
      'Returns recent published announcements applicable to the student class and academic year with read/unread flags.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of announcements to retrieve (default: 10, max: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of announcements.',
    type: [AnnouncementItemDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAnnouncements(
    @CurrentUser() student: AuthenticatedStudent,
    @Query('limit') limit?: number,
  ): Promise<AnnouncementItemDto[]> {
    const parsedLimit = limit ? Math.min(Math.max(1, Number(limit)), 50) : 10;
    return this.announcementsService.getAnnouncementsForStudent(student, parsedLimit);
  }

  @Get('bookmarks')
  @ApiOperation({
    summary: 'Bookmarks Preview',
    description:
      'Returns a preview list and total count of bookmarks saved by the authenticated student.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bookmarks preview and total count.',
    type: BookmarkPreviewResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getBookmarks(
    @CurrentUser() student: AuthenticatedStudent,
    @Query() query: BookmarkQueryDto,
  ): Promise<BookmarkPreviewResponseDto> {
    return this.bookmarksService.getBookmarksForStudent(student, query);
  }
}

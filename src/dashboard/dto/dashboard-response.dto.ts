import { ApiProperty } from '@nestjs/swagger';
import { StudentProfileDto } from '../../auth/dto/auth-response.dto';
import { TaskItemDto } from '../../tasks/dto/task-response.dto';
import { ContinueLearningDto } from '../../learning/dto/continue-learning-response.dto';
import { SubjectItemDto } from '../../subjects/dto/subject-response.dto';
import { ProgressResponseDto } from '../../progress/dto/progress-response.dto';
import { AnnouncementItemDto } from '../../announcements/dto/announcement-response.dto';

export class QuickActionsDto {
  @ApiProperty({ example: 3, description: 'Number of active bookmarks saved by the student' })
  bookmarksCount!: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ type: StudentProfileDto })
  student!: StudentProfileDto;

  @ApiProperty({ type: [TaskItemDto], description: 'Today and urgent upcoming tasks' })
  tasks!: TaskItemDto[];

  @ApiProperty({
    type: ContinueLearningDto,
    nullable: true,
    description: 'Most recently accessed eligible learning item, or null if none started',
  })
  continueLearning!: ContinueLearningDto | null;

  @ApiProperty({ type: [SubjectItemDto], description: 'Curriculum subjects with progress percentages' })
  subjects!: SubjectItemDto[];

  @ApiProperty({ type: ProgressResponseDto, description: 'Aggregated student progress metrics' })
  progress!: ProgressResponseDto;

  @ApiProperty({ type: [AnnouncementItemDto], description: 'Relevant published announcements' })
  announcements!: AnnouncementItemDto[];

  @ApiProperty({ type: QuickActionsDto })
  quickActions!: QuickActionsDto;
}

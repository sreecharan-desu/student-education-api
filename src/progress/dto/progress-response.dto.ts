import { ApiProperty } from '@nestjs/swagger';

export class DailyActivityDto {
  @ApiProperty({ example: 'Mon' })
  day!: string;

  @ApiProperty({ example: '2026-10-12' })
  date!: string;

  @ApiProperty({ example: 2, description: 'Number of learning items or tasks completed on this day' })
  count!: number;
}

export class SubjectProgressSummaryDto {
  @ApiProperty({ example: 'b0000000-0000-0000-0000-000000000001' })
  subjectId!: string;

  @ApiProperty({ example: 'Mathematics' })
  subjectName!: string;

  @ApiProperty({ example: 'MATH08' })
  subjectCode!: string;

  @ApiProperty({ example: 'calculator', nullable: true })
  iconKey!: string | null;

  @ApiProperty({ example: 1 })
  completedItems!: number;

  @ApiProperty({ example: 2 })
  totalItems!: number;

  @ApiProperty({ example: 50.0, nullable: true })
  progressPercent!: number | null;
}

export class ProgressResponseDto {
  @ApiProperty({ example: 3, description: 'Total published lessons marked completed' })
  completedLessons!: number;

  @ApiProperty({ example: 2, description: 'Total tasks marked completed' })
  completedTasks!: number;

  @ApiProperty({
    example: 91.5,
    nullable: true,
    description: 'Average score across completed QUIZ tasks, or null if no quizzes scored yet',
  })
  averageQuizScore!: number | null;

  @ApiProperty({ type: [DailyActivityDto], description: 'Activity counts over the trailing 7 days' })
  weeklyActivity!: DailyActivityDto[];

  @ApiProperty({ type: [SubjectProgressSummaryDto] })
  subjectWiseProgress!: SubjectProgressSummaryDto[];
}

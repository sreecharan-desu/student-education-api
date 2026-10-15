import { ApiProperty } from '@nestjs/swagger';

export class TaskSubjectSummaryDto {
  @ApiProperty({ example: 'b0000000-0000-0000-0000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'Mathematics' })
  name!: string;

  @ApiProperty({ example: 'MATH08' })
  code!: string;

  @ApiProperty({ example: 'calculator', nullable: true })
  iconKey!: string | null;
}

export class TaskItemDto {
  @ApiProperty({ example: '10000000-0000-0000-0000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'Rational Numbers Diagnostic Quiz' })
  title!: string;

  @ApiProperty({ example: '10 multiple-choice questions assessing closure properties.', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'QUIZ', enum: ['QUIZ', 'ASSIGNMENT', 'HOMEWORK', 'EXAM'] })
  taskType!: string;

  @ApiProperty({ type: TaskSubjectSummaryDto })
  subject!: TaskSubjectSummaryDto;

  @ApiProperty({ example: '2026-10-16T18:30:00.000Z', nullable: true })
  dueAt!: string | null;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'OVERDUE'],
    description: 'Current student task status with dynamic overdue evaluation',
  })
  status!: string;

  @ApiProperty({ example: 92.5, nullable: true })
  score!: number | null;

  @ApiProperty({ example: 'Great performance!', nullable: true })
  feedback!: string | null;

  @ApiProperty({ example: '2026-10-15T10:00:00.000Z', nullable: true })
  completedAt!: string | null;

  @ApiProperty({ example: false, description: 'True if task due date has passed without completion' })
  isOverdue!: boolean;
}

export class TaskListResponseDto {
  @ApiProperty({ type: [TaskItemDto] })
  tasks!: TaskItemDto[];

  @ApiProperty({ example: 5 })
  total!: number;

  @ApiProperty({ example: null, nullable: true })
  nextCursor!: string | null;
}

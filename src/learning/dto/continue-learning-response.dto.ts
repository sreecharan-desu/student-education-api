import { ApiProperty } from '@nestjs/swagger';
import { TaskSubjectSummaryDto } from '../../tasks/dto/task-response.dto';

export class ContinueLearningDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000003' })
  learningItemId!: string;

  @ApiProperty({ example: '1.2 Representation on Number Line' })
  title!: string;

  @ApiProperty({ example: 'LESSON', enum: ['LESSON', 'CHAPTER', 'SECTION'] })
  contentType!: string;

  @ApiProperty({ type: TaskSubjectSummaryDto })
  subject!: TaskSubjectSummaryDto;

  @ApiProperty({ example: 'Chapter 1: Rational Numbers', nullable: true })
  chapterTitle!: string | null;

  @ApiProperty({ example: 65.0, description: 'Percentage completed so far (0 - 100)' })
  progressPercent!: number;

  @ApiProperty({ example: 'section-2-number-line', nullable: true })
  lastPosition!: string | null;

  @ApiProperty({ example: '2026-10-15T09:30:00.000Z' })
  lastAccessedAt!: string;
}

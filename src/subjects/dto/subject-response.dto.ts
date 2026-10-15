import { ApiProperty } from '@nestjs/swagger';

export class SubjectItemDto {
  @ApiProperty({ example: 'b0000000-0000-0000-0000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'Mathematics' })
  name!: string;

  @ApiProperty({ example: 'MATH08' })
  code!: string;

  @ApiProperty({ example: 'calculator', nullable: true })
  iconKey!: string | null;

  @ApiProperty({ example: 1 })
  displayOrder!: number;

  @ApiProperty({ example: 8 })
  classLevel!: number;

  @ApiProperty({ example: 'Andhra Pradesh State Board' })
  board!: string;

  @ApiProperty({ example: 'English', nullable: true })
  medium!: string | null;

  @ApiProperty({ example: '2026-2027' })
  academicYear!: string;

  @ApiProperty({ example: 1, description: 'Number of completed published learning items' })
  completedItems!: number;

  @ApiProperty({ example: 2, description: 'Total published learning items for this subject' })
  totalItems!: number;

  @ApiProperty({
    example: 50.0,
    nullable: true,
    description: 'Completion percentage or null when no learning items exist',
  })
  progressPercent!: number | null;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BookmarkQueryDto {
  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    maximum: 50,
    description: 'Maximum number of bookmarks to return',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit cannot exceed 50' })
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Pagination cursor (bookmark ID)',
  })
  @IsOptional()
  cursor?: string;
}

export class BookmarkItemDto {
  @ApiProperty({ example: '30000000-0000-0000-0000-000000000001' })
  id!: string;

  @ApiProperty({ example: '00000000-0000-0000-0000-000000000002' })
  learningItemId!: string;

  @ApiProperty({ example: '1.1 Properties of Rational Numbers' })
  title!: string;

  @ApiProperty({ example: 'LESSON' })
  contentType!: string;

  @ApiProperty({ example: 'Mathematics' })
  subjectName!: string;

  @ApiProperty({ example: 'calculator', nullable: true })
  iconKey!: string | null;

  @ApiProperty({ example: '2026-10-15T09:00:00.000Z' })
  createdAt!: string;
}

export class BookmarkPreviewResponseDto {
  @ApiProperty({ example: 1 })
  totalCount!: number;

  @ApiProperty({ type: [BookmarkItemDto] })
  bookmarks!: BookmarkItemDto[];

  @ApiProperty({ example: null, nullable: true })
  nextCursor!: string | null;
}

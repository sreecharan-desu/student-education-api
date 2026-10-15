import { ApiProperty } from '@nestjs/swagger';

export class AnnouncementItemDto {
  @ApiProperty({ example: '20000000-0000-0000-0000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'SCERT Andhra Pradesh Academic Calendar 2026-2027 Released' })
  title!: string;

  @ApiProperty({ example: 'The annual curriculum planner is now available.' })
  message!: string;

  @ApiProperty({ example: 'ALL_STUDENTS', enum: ['ALL_STUDENTS', 'CLASS'] })
  audienceType!: string;

  @ApiProperty({ example: null, nullable: true })
  classLevel!: number | null;

  @ApiProperty({ example: '2026-2027' })
  academicYear!: string;

  @ApiProperty({ example: '2026-10-14T08:00:00.000Z' })
  publishedAt!: string;

  @ApiProperty({ example: null, nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ example: true, description: 'Whether the authenticated student has read this announcement' })
  isRead!: boolean;

  @ApiProperty({ example: '2026-10-14T10:15:00.000Z', nullable: true })
  readAt!: string | null;
}

export class MarkAnnouncementReadResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: '20000000-0000-0000-0000-000000000002' })
  announcementId!: string;

  @ApiProperty({ example: '2026-10-15T11:00:00.000Z' })
  readAt!: string;
}

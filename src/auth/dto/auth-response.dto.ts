import { ApiProperty } from '@nestjs/swagger';

export class StudentProfileDto {
  @ApiProperty({ example: 'c1234567-89ab-cdef-0123-456789abcdef' })
  id!: string;

  @ApiProperty({ example: 'student@vidya.local' })
  email!: string | null;

  @ApiProperty({ example: 'Aditya Varma' })
  fullName!: string;

  @ApiProperty({ example: 8 })
  classLevel!: number;

  @ApiProperty({ example: 'Andhra Pradesh State Board' })
  board!: string;

  @ApiProperty({ example: 'English' })
  medium!: string | null;

  @ApiProperty({ example: '2026-2027' })
  academicYear!: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', nullable: true })
  avatarUrl!: string | null;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Signed JWT Bearer Access Token',
  })
  accessToken!: string;

  @ApiProperty({
    example: '15m',
    description: 'Token expiration window',
  })
  expiresIn!: string;

  @ApiProperty({
    type: StudentProfileDto,
    description: 'Safe authenticated student profile',
  })
  student!: StudentProfileDto;
}

import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'student-education-api' })
  service!: string;

  @ApiProperty({ example: 'connected' })
  database!: string;

  @ApiProperty({ example: '2026-10-15T05:54:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: 'development' })
  environment!: string;
}

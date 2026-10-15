import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum TaskPeriodFilter {
  TODAY = 'today',
  UPCOMING = 'upcoming',
  ALL = 'all',
}

export enum TaskStatusFilter {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

export class TaskQueryDto {
  @ApiPropertyOptional({
    enum: TaskPeriodFilter,
    default: TaskPeriodFilter.ALL,
    description: 'Filter tasks by time period relative to student timezone (UTC default)',
  })
  @IsOptional()
  @IsEnum(TaskPeriodFilter, {
    message: 'Period must be one of: today, upcoming, all',
  })
  period?: TaskPeriodFilter = TaskPeriodFilter.ALL;

  @ApiPropertyOptional({
    enum: TaskStatusFilter,
    description: 'Filter tasks by completion status',
  })
  @IsOptional()
  @IsEnum(TaskStatusFilter, {
    message: 'Status must be one of: pending, in_progress, completed, overdue',
  })
  status?: TaskStatusFilter;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    maximum: 50,
    description: 'Maximum number of tasks to return',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit cannot exceed 50' })
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Pagination cursor (task ID)',
  })
  @IsOptional()
  cursor?: string;
}

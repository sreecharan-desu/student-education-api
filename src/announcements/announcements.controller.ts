import { Controller, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { MarkAnnouncementReadResponseDto } from './dto/announcement-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedStudent } from '../auth/interfaces/authenticated-student.interface';

@ApiTags('Announcements')
@ApiBearerAuth('JWT-auth')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark announcement as read',
    description: 'Marks an announcement as read for the authenticated student. Idempotent operation.',
  })
  @ApiParam({ name: 'id', description: 'Announcement UUID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Announcement successfully marked as read.',
    type: MarkAnnouncementReadResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Announcement not found.',
  })
  async markRead(
    @Param('id') id: string,
    @CurrentUser() student: AuthenticatedStudent,
  ): Promise<MarkAnnouncementReadResponseDto> {
    return this.announcementsService.markAsRead(id, student);
  }
}

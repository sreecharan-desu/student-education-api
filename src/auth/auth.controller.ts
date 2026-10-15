import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, StudentProfileDto } from './dto/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedStudent } from './interfaces/authenticated-student.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Student login',
    description: 'Authenticates student with email and password, returning JWT access token and profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns access token and student profile.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (e.g. invalid email format or missing fields).',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts. Rate limit exceeded.',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Current student profile',
    description: 'Returns the authenticated student profile derived from the validated JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current student profile.',
    type: StudentProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async getProfile(@CurrentUser() student: AuthenticatedStudent): Promise<StudentProfileDto> {
    return student;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Student logout',
    description: 'Logs out the student. In stateless JWT, the client should discard the stored access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Logged out successfully' },
      },
    },
  })
  async logout() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Retrieve student by email
    const student = await this.prisma.student.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Generic error to prevent email enumeration
    const invalidCredentialsMessage = 'Invalid email or password';

    if (!student || !student.passwordHash || !student.isActive) {
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new UnauthorizedException(invalidCredentialsMessage);
    }

    const isMatch = await bcrypt.compare(password, student.passwordHash);
    if (!isMatch) {
      this.logger.warn(`Password mismatch for student email: ${email}`);
      throw new UnauthorizedException(invalidCredentialsMessage);
    }

    const payload: JwtPayload = {
      sub: student.id,
      email: student.email,
      classLevel: student.classLevel,
      academicYear: student.academicYear,
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      expiresIn,
      student: {
        id: student.id,
        email: student.email,
        fullName: student.fullName,
        classLevel: student.classLevel,
        board: student.board,
        medium: student.medium,
        academicYear: student.academicYear,
        avatarUrl: student.avatarUrl,
      },
    };
  }
}

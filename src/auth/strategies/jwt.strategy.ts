import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedStudent } from '../interfaces/authenticated-student.interface';

export interface JwtPayload {
  sub: string;
  email: string | null;
  classLevel: number;
  academicYear: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-insecure-dev-secret-change-in-env'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedStudent> {
    const student = await this.prisma.student.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        classLevel: true,
        board: true,
        medium: true,
        academicYear: true,
        isActive: true,
      },
    });

    if (!student || !student.isActive) {
      throw new UnauthorizedException('Student account is inactive or not found');
    }

    const { isActive, ...safeProfile } = student;
    return safeProfile;
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockStudent = {
    id: 'test-student-id-123',
    email: 'student@vidya.local',
    fullName: 'Aditya Varma',
    passwordHash: bcrypt.hashSync('Student@2026!', 10),
    avatarUrl: null,
    classLevel: 8,
    board: 'Andhra Pradesh State Board',
    medium: 'English',
    academicYear: '2026-2027',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            student: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('15m'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should successfully authenticate student with valid credentials', async () => {
    jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(mockStudent as any);

    const result = await authService.login({
      email: 'student@vidya.local',
      password: 'Student@2026!',
    });

    expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
    expect(result).toHaveProperty('expiresIn', '15m');
    expect(result.student).toEqual({
      id: mockStudent.id,
      email: mockStudent.email,
      fullName: mockStudent.fullName,
      classLevel: mockStudent.classLevel,
      board: mockStudent.board,
      medium: mockStudent.medium,
      academicYear: mockStudent.academicYear,
      avatarUrl: mockStudent.avatarUrl,
    });
    // Ensure password hash is NEVER exposed
    expect((result as any).student.passwordHash).toBeUndefined();
  });

  it('should throw generic UnauthorizedException if email does not exist', async () => {
    jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'nonexistent@vidya.local',
        password: 'Password123!',
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
  });

  it('should throw generic UnauthorizedException if password does not match', async () => {
    jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(mockStudent as any);

    await expect(
      authService.login({
        email: 'student@vidya.local',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
  });

  it('should throw UnauthorizedException if student account is inactive', async () => {
    jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue({
      ...mockStudent,
      isActive: false,
    } as any);

    await expect(
      authService.login({
        email: 'student@vidya.local',
        password: 'Student@2026!',
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
  });
});

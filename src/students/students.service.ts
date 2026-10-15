import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedStudent } from '../auth/interfaces/authenticated-student.interface';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AuthenticatedStudent | null> {
    const student = await this.prisma.student.findUnique({
      where: { id },
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
      return null;
    }

    const { isActive, ...safeProfile } = student;
    return safeProfile;
  }

  async getProfile(id: string): Promise<AuthenticatedStudent> {
    const student = await this.findById(id);
    if (!student) {
      throw new NotFoundException('Student profile not found or inactive');
    }
    return student;
  }
}

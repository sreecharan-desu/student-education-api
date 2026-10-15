import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedStudent } from '../auth/interfaces/authenticated-student.interface';
import {
  BookmarkQueryDto,
  BookmarkPreviewResponseDto,
  BookmarkItemDto,
} from './dto/bookmark-response.dto';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async getBookmarksCountForStudent(studentId: string): Promise<number> {
    return this.prisma.bookmark.count({
      where: { studentId },
    });
  }

  async getBookmarksForStudent(
    student: AuthenticatedStudent,
    query: BookmarkQueryDto,
  ): Promise<BookmarkPreviewResponseDto> {
    const totalCount = await this.prisma.bookmark.count({
      where: { studentId: student.id },
    });

    const limit = query.limit || 10;

    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        studentId: student.id,
        learningItem: {
          isPublished: true,
        },
      },
      include: {
        learningItem: {
          include: {
            subject: {
              select: {
                name: true,
                iconKey: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
    });

    const hasNext = bookmarks.length > limit;
    const items = hasNext ? bookmarks.slice(0, limit) : bookmarks;
    const nextCursor = hasNext ? items[items.length - 1].id : null;

    const mapped: BookmarkItemDto[] = items.map((b) => ({
      id: b.id,
      learningItemId: b.learningItemId,
      title: b.learningItem.title,
      contentType: b.learningItem.contentType,
      subjectName: b.learningItem.subject.name,
      iconKey: b.learningItem.subject.iconKey,
      createdAt: b.createdAt.toISOString(),
    }));

    return {
      totalCount,
      bookmarks: mapped,
      nextCursor,
    };
  }
}

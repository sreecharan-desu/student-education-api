import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SubjectsModule } from '../subjects/subjects.module';
import { TasksModule } from '../tasks/tasks.module';
import { LearningModule } from '../learning/learning.module';
import { ProgressModule } from '../progress/progress.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { BookmarksModule } from '../bookmarks/bookmarks.module';

@Module({
  imports: [
    SubjectsModule,
    TasksModule,
    LearningModule,
    ProgressModule,
    AnnouncementsModule,
    BookmarksModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

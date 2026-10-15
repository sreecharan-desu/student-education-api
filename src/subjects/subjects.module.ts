import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';

@Module({
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}

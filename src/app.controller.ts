import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiExcludeEndpoint()
  root(@Res() res: any) {
    res.redirect('/api/docs', 302);
  }
}

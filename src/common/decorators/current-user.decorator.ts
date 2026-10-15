import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedStudent } from '../../auth/interfaces/authenticated-student.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedStudent | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedStudent;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);

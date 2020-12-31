import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../users/entity/user.entity';

export const AuthUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const gqlContext = GqlExecutionContext.create(ctx).getContext();
  const user: User = gqlContext['user'];
  return user;
});

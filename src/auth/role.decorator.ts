import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entity/user.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);

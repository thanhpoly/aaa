import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { Role } from 'src/constants/role.constant';
import { JwtPayload } from 'src/modules/auth/dto/jwt-payload.dto';

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

export const ROLES_KEY = 'roles';
export const Roles = (roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const JwtDecodedData = createParamDecorator(
  (data: string, ctx: ExecutionContext): JwtPayload => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request[COMMON_CONSTANT.JWT_DECODED_REQUEST_PARAM];
  },
);

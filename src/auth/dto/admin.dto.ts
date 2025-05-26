import { Role } from '../role/role.enum';
import { BaseUserDto } from './base.user.dto';

export class AdminDto extends BaseUserDto {
  role: Role = Role.ADMIN;
}

import { Role } from '../../role/role.enum';
import { BaseUserDto } from '../base.user.dto';

export class UserCreateDto extends BaseUserDto {
  role: Role = Role.USER;
}

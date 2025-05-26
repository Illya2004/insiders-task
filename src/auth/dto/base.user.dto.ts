import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../role/role.enum';

export class BaseUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 15)
  name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is not correct!' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  role: Role;

  async toEntity(): Promise<User> {
    const user = new User();
    Object.assign(user, this);
    user.password = await bcrypt.hash(this.password, 10);
    user.role = this.role;
    return user;
  }
}

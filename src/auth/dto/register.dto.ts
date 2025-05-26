import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  async toUser(): Promise<User> {
    const user = new User();
    Object.assign(user, this);
    user.password = await bcrypt.hash(this.password, 10);
    return user;
  }
}

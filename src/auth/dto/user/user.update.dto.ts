import { PartialType } from '@nestjs/mapped-types';
import { User } from '../../entity/user.entity';

export class UserUpdate extends PartialType(User) {}

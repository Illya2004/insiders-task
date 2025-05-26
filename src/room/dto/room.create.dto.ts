import { Room } from '../entity/room.entity';
import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class RoomCreateDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 15)
  name: string;

  @IsNotEmpty()
  @IsInt()
  capacity: number;

  toEntity(): Room {
    const user = new Room();
    Object.assign(user, this);

    return user;
  }
}

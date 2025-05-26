import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoomResponseDto } from '../dto/room.response.dto';
import { Booking } from '../../booking/entity/booking.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'int' })
  capacity: number;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];

  toDto(): RoomResponseDto {
    const response = new RoomResponseDto();
    Object.assign(response, this);
    return response;
  }
}

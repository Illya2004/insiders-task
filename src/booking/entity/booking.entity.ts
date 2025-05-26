import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '../../room/entity/room.entity';
import { User } from '../../auth/entity/user.entity';
import { BookingResponseDto } from '../dto/booking.response.dto';

@Index(['user', 'room', 'start_time', 'end_time'], { unique: true })
@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Room, { eager: true })
  room: Room;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column()
  isDeleted: boolean;

  public toDto(): BookingResponseDto {
    const response = new BookingResponseDto();
    Object.assign(response, this);

    return response;
  }
}

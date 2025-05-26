import { IsDateString, IsUUID } from 'class-validator';
import { Booking } from '../entity/booking.entity';

export class BookingCreateDto {
  @IsUUID()
  roomId: string;

  @IsUUID()
  userId: string;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;

  toEntity(): Booking {
    const booking = new Booking();
    Object.assign(booking, this);

    return booking;
  }
}

import { PartialType } from '@nestjs/mapped-types';
import { Booking } from '../entity/booking.entity';

export class BookingUpdateDto extends PartialType(Booking) {}

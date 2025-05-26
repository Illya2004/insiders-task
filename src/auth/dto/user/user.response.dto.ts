import { BookingResponseDto } from '../../../booking/dto/booking.response.dto';
import { Role } from '../../role/role.enum';

export class UserResponseDto {
  id: string;
  name: string;

  email: string;
  password: string;

  role: Role;

  bookings: BookingResponseDto[];
}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserResponseDto } from '../dto/user/user.response.dto';
import { Booking } from '../../booking/entity/booking.entity';
import { Role } from '../role/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: Role;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  public toDtoPassword(): Partial<User> {
    const response: Partial<User> = {};
    Object.assign(response, this);
    return response;
  }

  public toDto(): UserResponseDto {
    const { bookings, ...rest } = this;
    const response = new UserResponseDto();
    Object.assign(response, rest);

    response.bookings = bookings?.map((booking) => booking.toDto()) || [];
    return response;
  }
}

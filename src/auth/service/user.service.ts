import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { UserUpdate } from '../dto/user/user.update.dto';
import { UserResponseDto } from '../dto/user/user.response.dto';
import { UserCreateDto } from '../dto/user/user.create.dto';
import { BookingResponseDto } from '../../booking/dto/booking.response.dto';
import * as bcrypt from 'bcrypt';
import { AdminDto } from '../dto/admin.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmailRaw(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async create(dto: UserCreateDto): Promise<UserResponseDto> {
    const user = await dto.toEntity();
    const savedUser = await this.userRepository.save(user);
    return savedUser.toDto();
  }

  async createAdminEntity(dto: AdminDto): Promise<User> {
    const user = await dto.toEntity();

    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  async createUserEntity(dto: UserCreateDto): Promise<User> {
    const user = await dto.toEntity();

    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User with id ${id} not found');

    return user.toDto();
  }

  async update(id: string, dto: UserUpdate): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    Object.assign(user, dto);
    const updatedUser = await this.userRepository.save(user);

    return updatedUser.toDto();
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user.toDto();
  }

  async findByIdEntity(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmailRaw(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findByEmail(email: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user.toDtoPassword();
  }

  async delete(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.delete(id);
  }

  async findAllBookingsByUserId(
    id: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<BookingResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['bookings'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const bookings = user.bookings.map((booking) => booking.toDto());
    if (currentUserRole === 'admin' || currentUserId === id) {
      return bookings;
    }

    throw new ForbiddenException('Access denied');
  }
}

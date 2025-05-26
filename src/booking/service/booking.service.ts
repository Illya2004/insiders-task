import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking } from '../entity/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingCreateDto } from '../dto/booking.create.dto';
import { BookingResponseDto } from '../dto/booking.response.dto';
import { PaginationResponse } from '../../types/pagination.response';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async findAll(
    skip: number,
    limit: number,
  ): Promise<PaginationResponse<BookingResponseDto>> {
    const safeSkip = typeof skip === 'number' && !Number.isNaN(skip) ? skip : 0;
    const safeLimit =
      typeof limit === 'number' && !Number.isNaN(limit) ? limit : 10;

    const total = await this.bookingRepository.count();

    const bookings = await this.bookingRepository.find({
      skip: safeSkip,
      take: safeLimit,
    });

    const items = bookings.map((booking) => booking.toDto());

    return {
      items,
      total,
    };
  }

  async create(dto: BookingCreateDto): Promise<BookingResponseDto> {
    try {
      const { roomId, userId, start_time, end_time } = dto;

      const overlapping = await this.bookingRepository
        .createQueryBuilder('booking')
        .innerJoin('booking.room', 'room')
        .where('room.id = :roomId', { roomId })
        .andWhere(
          `(
          booking.start_time < :end_time AND
          booking.end_time > :start_time
        )`,
          { start_time, end_time },
        )
        .getOne();

      if (overlapping) {
        throw new HttpException(
          'Час бронювання конфліктує з іншим бронюванням.',
          HttpStatus.CONFLICT,
        );
      }

      const booking = this.bookingRepository.create({
        room: { id: roomId },
        user: { id: userId },
        start_time: new Date(start_time),
        end_time: new Date(end_time),
      });

      const saved = await this.bookingRepository.save(booking);

      return saved.toDto();
    } catch (error) {
      console.error('Booking creation error:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Виникла помилка під час створення бронювання.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteBooking(
    id: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (currentUserRole === 'admin') {
      await this.bookingRepository.delete(id);
      return;
    }

    if (booking.user.id !== currentUserId) {
      throw new ForbiddenException('You can only delete your own bookings');
    }

    if (booking.start_time <= new Date()) {
      throw new ForbiddenException('You can only delete future bookings');
    }

    await this.bookingRepository.delete(id);
  }
}

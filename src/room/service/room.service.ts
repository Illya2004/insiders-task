import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from '../entity/room.entity';
import { Repository } from 'typeorm';
import { RoomResponseDto } from '../dto/room.response.dto';
import { RoomCreateDto } from '../dto/room.create.dto';
import { Booking } from '../../booking/entity/booking.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async create(dto: RoomCreateDto): Promise<RoomResponseDto> {
    const room = dto.toEntity();

    const response = await this.roomRepository.save(room);
    return response.toDto();
  }

  async findAvailableRooms(
    startTime: Date,
    endTime: Date,
  ): Promise<RoomResponseDto[]> {
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.bookings', 'booking')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('booking.id')
          .from(Booking, 'booking')
          .where('booking.roomId = room.id')
          .andWhere('booking.start_time < :end_time')
          .andWhere('booking.end_time > :start_time')
          .getQuery();
        return `NOT EXISTS ${subQuery}`;
      })
      .setParameters({ start_time: startTime, end_time: endTime })
      .getMany();

    return rooms.map((room) => room.toDto());
  }
}

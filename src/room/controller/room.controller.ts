import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoomService } from '../service/room.service';
import { RoomCreateDto } from '../dto/room.create.dto';
import { RoomResponseDto } from '../dto/room.response.dto';
import { Roles } from '../../auth/role/roles.decorator';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../../auth/role/roles.quard';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() room: RoomCreateDto, req: Request): Promise<RoomResponseDto> {
    return this.roomService.create(room);
  }

  @Get('available')
  async getAvailableRooms(
    @Query('start_time') startTime: string,
    @Query('end_time') endTime: string,
  ): Promise<RoomResponseDto[]> {
    if (!startTime || !endTime) {
      throw new BadRequestException('start_time and end_time are required');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('start_time must be before end_time');
    }

    return this.roomService.findAvailableRooms(start, end);
  }
}

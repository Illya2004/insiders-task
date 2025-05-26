import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from '../service/booking.service';
import { Roles } from '../../auth/role/roles.decorator';
import { BookingCreateDto } from '../dto/booking.create.dto';
import { BookingResponseDto } from '../dto/booking.response.dto';
import { PaginationResponse } from '../../types/pagination.response';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../../auth/role/roles.quard';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Roles('user', 'admin')
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req,
    @Query('soft') soft?: string,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;

    const isSoftDelete = soft === 'true';

    if (isSoftDelete) {
      await this.bookingService.softDelete(id, userId, userRole);
    } else {
      await this.bookingService.deleteBooking(id, userId, userRole);
    }

    return { message: 'Booking deleted successfully' };
  }

  @Post()
  async create(@Body() dto: BookingCreateDto): Promise<BookingResponseDto> {
    return this.bookingService.create(dto);
  }

  @Get()
  @Roles('admin')
  findAll(
    @Query() query: { skip?: string; limit?: string },
  ): Promise<PaginationResponse<BookingResponseDto>> {
    const skip = Number(query.skip);
    const limit = Number(query.limit);

    return this.bookingService.findAll(
      Number.isNaN(skip) ? 0 : skip,
      Number.isNaN(limit) ? 10 : limit,
    );
  }
}

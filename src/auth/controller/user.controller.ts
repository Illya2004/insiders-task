import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserUpdate } from '../dto/user/user.update.dto';
import { UserCreateDto } from '../dto/user/user.create.dto';
import { UserResponseDto } from '../dto/user/user.response.dto';
import { Roles } from '../role/roles.decorator';
import { RolesGuard } from '../role/roles.quard';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() user: UserCreateDto): Promise<UserResponseDto> {
    return this.userService.create(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() user: UserUpdate,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.userService.delete(id);
  }

  @Get('/:id/bookings')
  @Roles('admin', 'user')
  async findAllBookingsByUserId(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const userRole = req.user.role;

    return await this.userService.findAllBookingsByUserId(id, userId, userRole);
  }
}

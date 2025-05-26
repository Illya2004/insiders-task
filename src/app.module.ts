import { Module, OnModuleInit } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/controller/auth.controller';
import { UserController } from './auth/controller/user.controller';
import { BookingController } from './booking/controller/booking.controller';
import { RoomController } from './room/controller/room.controller';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { RoomModule } from './room/room.module';
import { AuthService } from './auth/service/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    BookingModule,
    RoomModule,
  ],
  controllers: [
    UserController,
    AuthController,
    BookingController,
    RoomController,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    await this.authService.createDefaultAdmin();
  }
}

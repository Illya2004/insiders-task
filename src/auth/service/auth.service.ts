import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../dto/register.dto';
import { UserService } from './user.service';
import { LoginDto } from '../dto/login.dto';
import { User } from '../entity/user.entity';
import { UserCreateDto } from '../dto/user/user.create.dto';
import { AdminDto } from '../dto/admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userService.findByEmailRaw(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const userDto = new UserCreateDto();
    Object.assign(userDto, dto);

    const savedUser = await this.userService.createUserEntity(userDto);

    return savedUser.toDto();
  }

  async createDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'strongpassword';

    const existingAdmin = await this.userService.findByEmailRaw(adminEmail);
    if (!existingAdmin) {
      const adminDto = new AdminDto();
      adminDto.email = adminEmail;
      adminDto.name = 'Admin';
      adminDto.password = adminPassword;

      const adminUser = await this.userService.createAdminEntity(adminDto);
      console.log('Admin user created:', adminUser.email);
    } else {
      console.log('Admin user already exists');
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userService.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userService.findByIdEntity(payload.sub);
      if (!user) throw new ForbiddenException();

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch (err) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, role: user['role'] || 'user' };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}

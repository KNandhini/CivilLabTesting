import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUser } from './entities/app-user.entity';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { LoginAppUserDto } from './dto/login-app-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AppChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AppUsersService {
  constructor(
    @InjectRepository(AppUser)
    private appUserRepository: Repository<AppUser>,
    private jwtService: JwtService,
  ) {}

  async register(createAppUserDto: CreateAppUserDto) {
    const existingUser = await this.appUserRepository.findOne({
      where: [
        { email: createAppUserDto.email },
        { mobileNumber: createAppUserDto.mobileNumber }
      ]
    });

    if (existingUser) {
      throw new ConflictException('User already exists with this email or mobile number');
    }

    const hashedPassword = await bcrypt.hash(createAppUserDto.password, 10);
    const user = this.appUserRepository.create({
      ...createAppUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.appUserRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  async login(loginAppUserDto: LoginAppUserDto) {
    const user = await this.appUserRepository.findOne({
      where: [
        { mobileNumber: loginAppUserDto.userName },
        { email: loginAppUserDto.userName }
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginAppUserDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      userId: user.id, 
      mobileNumber: user.mobileNumber,
      isMobileApp: true 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber
      }
    };
  }

  async findAll() {
    const users = await this.appUserRepository.find();
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: string) {
    const user = await this.appUserRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  async update(id: string, updateAppUserDto: Partial<CreateAppUserDto>) {
    const user = await this.findOne(id);
    if (updateAppUserDto.password) {
      updateAppUserDto.password = await bcrypt.hash(updateAppUserDto.password, 10);
    }
    await this.appUserRepository.update(id, updateAppUserDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.appUserRepository.remove(user as AppUser);
    return { message: 'User deleted successfully' };
  }

  async changePassword(userId: string, changePasswordDto: AppChangePasswordDto) {
    const user = await this.appUserRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.appUserRepository.update(userId, { password: hashedNewPassword });

    return { message: 'Password changed successfully' };
  }

  async logout(userId: string) {
      // You might want to add token to a blacklist or invalidate it in your system
      return {
        message: 'Logged out successfully',
        success: true
      };
    }
}
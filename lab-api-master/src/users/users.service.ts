import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import { UserQueryDto } from './dto/user-query.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const user = this.userRepository.create({
      ...registerUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string, firstName:String, lastName:string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      firstName: user.firstName,
      lastName: user.lastName,
      ...payload,

    };
  }

  async findAll(query: UserQueryDto) {
    const { search, page, limit } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.role',
        'user.status',
        'user.createdAt',
        'user.updatedAt'
      ]);

    if (search) {
      queryBuilder.where(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string): Promise<User|null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });
  
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      const isPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password
      );
  
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
  
      const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
      await this.userRepository.update(userId, { password: hashedPassword });
  
      return { message: 'Password changed successfully' };
    }

  async deleteUser(id: string) {
    await this.userRepository.delete(id);
    return { message: 'User deleted successfully' };
  }

  async updateUser(
    id: string,
    updateDto: { firstName?: string; lastName?: string; email?: string; role?: string }
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Only update provided fields
    const updateData: any = {};
    if (updateDto.firstName !== undefined) updateData.firstName = updateDto.firstName;
    if (updateDto.lastName !== undefined) updateData.lastName = updateDto.lastName;
    if (updateDto.email !== undefined) updateData.email = updateDto.email;
    if (updateDto.role !== undefined) updateData.role = updateDto.role;

    await this.userRepository.update(id, updateData);

    return { message: 'User updated successfully' };
  }

  async updateOrResetPassword(
    id: string,
    passwordDto: { password: string }
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hashedPassword = await bcrypt.hash(passwordDto.password, 10);
    await this.userRepository.update(id, { password: hashedPassword });

    return { message: 'Password updated successfully' };
  }
}
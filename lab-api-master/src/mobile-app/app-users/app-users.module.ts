import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppUsersController } from './app-users.controller';
import { AppUsersService } from './app-users.service';
import { AppUser } from './entities/app-user.entity';
import { mobileAppJwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppUser]),
    JwtModule.register(mobileAppJwtConfig),
  ],
  controllers: [AppUsersController],
  providers: [AppUsersService],
})
export class AppUsersModule {}
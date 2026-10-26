import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: '123456',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [UsersService, JwtStrategy, JwtAuthGuard],
  controllers: [UsersController],
  exports: [UsersService, JwtAuthGuard]
})
export class UsersModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { Request } from './entities/request.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request]),
    UsersModule
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService, TypeOrmModule],
})
export class RequestsModule {}
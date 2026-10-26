import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppRequestsController } from './app-requests.controller';
import { AppRequestsService } from './app-requests.service';
import { AppRequest } from './entities/app-request.entity';
import { AppRequestTestsMap } from '../app-request-tests-map/entities/app-request-tests-map.entity';
import { AppTest } from '../app-tests/entities/app-test.entity';
import { MobileJwtAuthGuard } from '../guards/mobile-jwt-auth.guard';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { EitherJwtAuthGuard } from '../guards/either-jwt-auth.guard';
import { Test } from 'src/tests/entities/test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppRequest, AppRequestTestsMap, AppTest, Test])],
  controllers: [AppRequestsController],
  providers: [
    AppRequestsService,
    MobileJwtAuthGuard,
    JwtAuthGuard,
    EitherJwtAuthGuard,
  ],
  exports: [AppRequestsService],
})
export class AppRequestsModule {}
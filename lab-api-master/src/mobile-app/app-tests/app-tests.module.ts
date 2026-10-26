import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppTestsController } from './app-tests.controller';
import { AppTestsService } from './app-tests.service';
import { AppTest } from './entities/app-test.entity';
import { MobileJwtAuthGuard } from '../guards/mobile-jwt-auth.guard';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { EitherJwtAuthGuard } from '../guards/either-jwt-auth.guard';
import { AppRequestTestsMap } from '../app-request-tests-map/entities/app-request-tests-map.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppTest,AppRequestTestsMap])],
  controllers: [AppTestsController],
  providers: [AppTestsService,  MobileJwtAuthGuard,
    JwtAuthGuard,
    EitherJwtAuthGuard,],
})
export class AppTestsModule {}
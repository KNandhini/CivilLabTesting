import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppRequestTestsMapController } from './app-request-tests-map.controller';
import { AppRequestTestsMapService } from './app-request-tests-map.service';
import { AppRequestTestsMap } from './entities/app-request-tests-map.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppRequestTestsMap])],
  controllers: [AppRequestTestsMapController],
  providers: [AppRequestTestsMapService],
})
export class AppRequestTestsMapModule {}
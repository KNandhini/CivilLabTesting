import { Body, Controller, Get, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("configuration")
  getConfig() {
    return this.appService.getConfig();
  }

  @Put("configuration")
  updateConfig(@Body() config: any) {
    return this. appService.updateConfig(config);
  }
}

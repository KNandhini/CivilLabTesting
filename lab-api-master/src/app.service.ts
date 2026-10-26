import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class AppService {
  private readonly configPath = path.join(__dirname, './configuration.json');

  getHello(): string {
    return 'Hello World!';
  }


  getConfig() {
    const configFile = fs.readFileSync(this.configPath, 'utf8');
    return JSON.parse(configFile);
  }

  updateConfig(config: any) {
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    return { success: true };
  }
}

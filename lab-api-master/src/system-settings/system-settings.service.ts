import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettings } from './entities/system-settings.entity';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { CreateSystemSettingsDto } from './dto/create-system-settings.dto';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSettings)
    private readonly systemSettingsRepository: Repository<SystemSettings>,
  ) {}

  async getSettings(): Promise<SystemSettings> {
    let systemSettings = await this.systemSettingsRepository.findOne({
      where: {},
    });

    if (!systemSettings) {
      systemSettings = this.systemSettingsRepository.create({
        id: 'default',
        data: {},
      });
      await this.systemSettingsRepository.save(systemSettings);
    }

    return systemSettings;
  }

  async create(
    createSystemSettingsDto: CreateSystemSettingsDto,
  ): Promise<SystemSettings> {
    const existingSettings = await this.systemSettingsRepository.findOne({
      where: {},
    });

    if (existingSettings) {
      return this.update(createSystemSettingsDto);
    }

    const systemSettings = this.systemSettingsRepository.create({
      id: 'default',
      ...createSystemSettingsDto,
    });
    return this.systemSettingsRepository.save(systemSettings);
  }

  async update(
    updateSystemSettingsDto: UpdateSystemSettingsDto,
  ): Promise<SystemSettings> {
    const systemSettings = await this.getSettings();

    const updatedData = {
      ...systemSettings.data,
      ...updateSystemSettingsDto.data,
    };

    systemSettings.data = updatedData;
    return this.systemSettingsRepository.save(systemSettings);
  }

  async getSettingsByKey(key: string): Promise<any> {
    const systemSettings = await this.getSettings();
    return systemSettings.data?.[key] || null;
  }

  async updateSettingsByKey(key: string, value: any): Promise<SystemSettings> {
    const systemSettings = await this.getSettings();

    systemSettings.data = {
      ...systemSettings.data,
      [key]: value,
    };

    return this.systemSettingsRepository.save(systemSettings);
  }

  async resetSettings(): Promise<SystemSettings> {
    const systemSettings = await this.getSettings();
    systemSettings.data = {};
    return this.systemSettingsRepository.save(systemSettings);
  }

  async resetUlrNo(): Promise<SystemSettings> {
    const systemSettings = await this.getSettings();
    systemSettings.ulrNo = 0;
    return this.systemSettingsRepository.save(systemSettings);
  }

  async getUlrNo(): Promise<number> {
    const systemSettings = await this.getSettings();
    return systemSettings.ulrNo;
  }

  async updateUlrNo(ulrNo: number): Promise<SystemSettings> {
    const systemSettings = await this.getSettings();
    systemSettings.ulrNo = ulrNo;
    return this.systemSettingsRepository.save(systemSettings);
  }

  async getTrfNo(reportType: string): Promise<number> {
    const systemSettings = await this.getSettings();
    return reportType === 'NON-NABL'
      ? (systemSettings.trfNoNonNabl ?? 0)
      : (systemSettings.trfNoNabl ?? 0);
  }

  async updateTrfNo(
    reportType: string,
    value: number,
  ): Promise<SystemSettings> {
    const systemSettings = await this.getSettings();
    if (reportType === 'NON-NABL') {
      systemSettings.trfNoNonNabl = value;
    } else {
      systemSettings.trfNoNabl = value;
    }
    return this.systemSettingsRepository.save(systemSettings);
  }

  async resetTrfNo(reportType: string): Promise<SystemSettings> {
    return this.updateTrfNo(reportType, 0);
  }
}

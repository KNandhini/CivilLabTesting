import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { CreateSystemSettingsDto } from './dto/create-system-settings.dto';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { SystemSettings } from './entities/system-settings.entity';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

@ApiTags('system-settings')
@Controller('system-settings')
//@UseGuards(JwtAuthGuard)
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create system settings (only if none exist)' })
  @ApiResponse({ status: 201, description: 'System settings created successfully', type: SystemSettings })
  create(@Body() createSystemSettingsDto: CreateSystemSettingsDto) {
    return this.systemSettingsService.create(createSystemSettingsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({ status: 200, description: 'System settings retrieved successfully', type: SystemSettings })
  getSettings() {
    return this.systemSettingsService.getSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Update system settings' })
  @ApiResponse({ status: 200, description: 'System settings updated successfully', type: SystemSettings })
  update(@Body() updateSystemSettingsDto: UpdateSystemSettingsDto) {
    return this.systemSettingsService.update(updateSystemSettingsDto);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get system settings by key' })
  @ApiResponse({ status: 200, description: 'Settings value for the specified key' })
  getSettingsByKey(@Param('key') key: string) {
    return this.systemSettingsService.getSettingsByKey(key);
  }

  @Patch('key/:key')
  @ApiOperation({ summary: 'Update system settings by key' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully', type: SystemSettings })
  updateSettingsByKey(@Param('key') key: string, @Body() value: any) {
    return this.systemSettingsService.updateSettingsByKey(key, value);
  }

  @Patch('reset')
  @ApiOperation({ summary: 'Reset system settings to empty' })
  @ApiResponse({ status: 200, description: 'System settings reset successfully', type: SystemSettings })
  resetSettings() {
    return this.systemSettingsService.resetSettings();
  }

  @Get('trf-no')
  @ApiOperation({ summary: 'Get current TRF counter value' })
  getTrfNo(@Query('reportType') reportType: string) {
    return this.systemSettingsService.getTrfNo(reportType || 'NABL');
  }

  @Patch('trf-no')
  @ApiOperation({ summary: 'Set TRF counter to a specific value' })
  @ApiBody({ schema: { type: 'object', properties: { value: { type: 'number', example: 7 } } } })
  updateTrfNo(@Query('reportType') reportType: string, @Body() body: { value: number }) {
    return this.systemSettingsService.updateTrfNo(reportType || 'NABL', body.value);
  }

  @Patch('trf-no/reset')
  @ApiOperation({ summary: 'Reset TRF counter to 0' })
  resetTrfNo(@Query('reportType') reportType: string) {
    return this.systemSettingsService.resetTrfNo(reportType || 'NABL');
  }
} 
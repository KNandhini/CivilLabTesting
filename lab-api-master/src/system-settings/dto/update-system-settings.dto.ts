import { PartialType } from '@nestjs/swagger';
import { CreateSystemSettingsDto } from './create-system-settings.dto';

export class UpdateSystemSettingsDto extends PartialType(CreateSystemSettingsDto) {} 
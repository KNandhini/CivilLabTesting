import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateAppRequestTestsMapDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  testId: string;
}
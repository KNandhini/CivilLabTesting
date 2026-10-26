import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppUsersService } from './app-users.service';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { LoginAppUserDto } from './dto/login-app-user.dto';
import { AppChangePasswordDto } from './dto/change-password.dto';
import { MobileJwtAuthGuard } from '../guards/mobile-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('mobile-app/app-users')
@Controller('mobile-app/app-users')
export class AppUsersController {
  constructor(private readonly appUsersService: AppUsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new app user' })
  register(@Body() createAppUserDto: CreateAppUserDto) {
    return this.appUsersService.register(createAppUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login app user' })
  login(@Body() loginAppUserDto: LoginAppUserDto) {
    return this.appUsersService.login(loginAppUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all app users' })
  findAll() {
    return this.appUsersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get app user by id' })
  findOne(@Param('id') id: string) {
    return this.appUsersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update app user' })
  update(@Param('id') id: string, @Body() updateAppUserDto: Partial<CreateAppUserDto>) {
    return this.appUsersService.update(id, updateAppUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete app user' })
  remove(@Param('id') id: string) {
    return this.appUsersService.remove(id);
  }

  @Post('change-password')
  @UseGuards(MobileJwtAuthGuard)
  @ApiOperation({ summary: 'Change user password' })
  changePassword(
    @Body() changePasswordDto: AppChangePasswordDto,
    @CurrentUser() user: any
  ) {
    return this.appUsersService.changePassword(user.userId, changePasswordDto);
  }

  @Post('logout')
  @UseGuards(MobileJwtAuthGuard)
  @ApiOperation({ summary: 'Logout app user' })
  async logout(@CurrentUser() user: any) {
    return this.appUsersService.logout(user.userId);
  }
}
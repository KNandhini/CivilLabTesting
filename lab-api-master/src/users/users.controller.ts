import { Controller, Post, Body, UseGuards, Get, Query, Patch, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UserQueryDto } from './dto/user-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new admin user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.usersService.register(registerUserDto);
    const { password, ...result } = user;
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin user login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('getById')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by Id' })
   findById(@CurrentUser() user: any,@Query() id?:string) {
    // Check if id is an empty object or has a valid value
    const userId = typeof id === 'object' && id !== null && Object.keys(id).length === 0 ? user.userId : id;
    return this.usersService.findById(userId);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: any

  ) {
    return this.usersService.changePassword(user.userId, changePasswordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateDto: { firstName?: string; lastName?: string; email?: string; role?: string }
  ) {
    return this.usersService.updateUser(id, updateDto);
  }

  @Patch('reset-password/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset user password (admin only)' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  async resetPassword(
    @Param('id') id: string,
    @Body() passwordDto: { password: string }
  ) {
    return this.usersService.updateOrResetPassword(id, passwordDto);
  }

  
}
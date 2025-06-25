import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from 'src/user/dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService) { }

  @ApiOperation({ summary: 'Auth your account'})
  @ApiResponse({ status: 201, description: 'Generate your access_token'})
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.signIn(req.user);
  }

  @ApiOperation({ summary: 'Create a account'})
  @ApiResponse({ status: 201, description: 'Account creation success'})
  @ApiBody({ type: CreateUserDto })
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}

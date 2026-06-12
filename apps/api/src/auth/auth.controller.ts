import { Controller, Post, Get, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('fullName') fullName: string,
    @Body('password') password: string,
  ) {
    if (!email || !fullName || !password) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }
    return this.authService.register(email, fullName, password);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }
    return this.authService.login(email, password);
  }

  @Get('me')
  async me(@Headers('authorization') authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = this.authService.verifyJwt(token);
    
    if (!decoded) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.authService.getMe(decoded.id);
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Hasher } from 'src/common/utils/auth';
import { LoginResponse } from './interfaces/login-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('El correo no existe');
    }

    const isPasswordValid = await Hasher.checkPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      area: user.area,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        area: user.area,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}

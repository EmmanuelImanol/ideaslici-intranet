import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    // Extraemos el secreto y validamos su existencia para evitar tipos undefined
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET no está definido en las variables de entorno',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Verificamos que el payload tenga la estructura esperada
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Token incompleto o mal formado');
    }

    return await Promise.resolve({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  }
}

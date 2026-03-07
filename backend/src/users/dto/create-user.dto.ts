import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/interfaces/roles.enum';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(50, { message: 'El nombre es demasiado largo' })
  firstName: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(50, { message: 'El apellido es demasiado largo' })
  lastName: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(Role, { message: 'El rol debe ser: admin, gerente o empleado' })
  @IsNotEmpty()
  role: Role;
}

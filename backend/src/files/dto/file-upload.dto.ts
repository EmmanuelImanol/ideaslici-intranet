import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class FileUploadDto {
  @IsString()
  @IsNotEmpty({ message: 'Debes darle un título al archivo' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({
    message: 'La categoría es obligatoria (ej: Capacitación, RRHH)',
  })
  category: string;
}

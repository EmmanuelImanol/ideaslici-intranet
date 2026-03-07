import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  colorClass: string;
}

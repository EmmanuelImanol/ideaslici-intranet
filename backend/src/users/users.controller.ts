import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/common/interfaces/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('count') // Recuerda: ¡Las rutas estáticas ARRIBA!
  @Roles(Role.ADMIN, Role.GERENTE)
  async getCount() {
    const count = await this.usersService.countActive();
    return { count };
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Post('register')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: number) {
    return await this.usersService.softDelete(id);
  }
}

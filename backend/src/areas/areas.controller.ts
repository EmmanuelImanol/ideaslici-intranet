import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/interfaces/roles.enum';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('areas')
@UseGuards(JwtAuthGuard)
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areasService.create(createAreaDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE)
  async findAll(@Req() req: RequestWithUser) {
    const allAreas = await this.areasService.findAll();
    const user = req.user;
    if (user.role === Role.ADMIN) return allAreas;
    return allAreas.filter((area) => area.name.toLowerCase() !== 'general');
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  findOne(@Param('id') id: string) {
    return this.areasService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areasService.update(+id, updateAreaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.areasService.remove(+id);
  }
}

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { Not, Repository } from 'typeorm';
import { FileMetadata } from 'src/files/entities/file-metadata.entity';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(FileMetadata)
    private readonly fileRepository: Repository<FileMetadata>,
  ) {}

  async create(createAreaDto: CreateAreaDto) {
    const existingArea = await this.areaRepository.findOne({
      where: { name: createAreaDto.name.trim() },
    });
    if (existingArea) {
      throw new ConflictException(`El área "${createAreaDto.name}" ya existe.`);
    }
    const area = this.areaRepository.create({
      ...createAreaDto,
      name: createAreaDto.name.trim(),
    });
    return await this.areaRepository.save(area);
  }

  async findAll() {
    return await this.areaRepository.find({
      order: { name: 'ASC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} area`;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const area = await this.areaRepository.findOneBy({ id });
    if (!area) throw new NotFoundException('Área no encontrada');
    if (updateAreaDto.name) {
      const nameTrimmed = updateAreaDto.name.trim();
      const duplicate = await this.areaRepository.findOne({
        where: { name: nameTrimmed, id: Not(id) },
      });
      if (duplicate) {
        throw new ConflictException(
          `Ya existe otra área con el nombre "${nameTrimmed}".`,
        );
      }
      area.name = nameTrimmed;
    }

    if (updateAreaDto.colorClass) {
      area.colorClass = updateAreaDto.colorClass;
    }
    return await this.areaRepository.save(area);
  }

  async remove(id: number) {
    const areaToDelete = await this.areaRepository.findOneBy({ id });
    if (!areaToDelete) {
      throw new NotFoundException(`La área no existe`);
    }
    if (areaToDelete.name.toLowerCase() === 'general') {
      throw new ForbiddenException(
        'No se puede eliminar el área maestra "General".',
      );
    }
    let generalArea = await this.areaRepository.findOne({
      where: { name: 'General' },
    });
    if (!generalArea) {
      generalArea = this.areaRepository.create({
        name: 'General',
        colorClass: 'bg-slate-900 text-white',
      });
      await this.areaRepository.save(generalArea);
    }
    await this.fileRepository.update(
      { area: { id: areaToDelete.id } },
      { area: generalArea },
    );
    await this.areaRepository.remove(areaToDelete);
    return {
      message: `Área eliminada. Los archivos fueron movidos a "${generalArea.name}".`,
    };
  }
}

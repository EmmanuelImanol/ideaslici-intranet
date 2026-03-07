import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { FileMetadata } from './entities/file-metadata.entity';
import { Repository } from 'typeorm';
import { FileUploadDto } from './dto/file-upload.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileMetadata)
    private readonly fileRepository: Repository<FileMetadata>,
  ) {}
  private readonly uploadPath = join(process.cwd(), 'static', 'uploads');

  async findAll() {
    return await this.fileRepository.find({
      order: {
        createdAt: 'DESC', // Los más recientes primero
      },
      relations: ['uploadedBy'],
    });
  }

  async registerFileData(
    file: Express.Multer.File,
    dto: FileUploadDto,
    user: any,
  ): Promise<FileMetadata> {
    const newFile = this.fileRepository.create({
      title: dto.title,
      category: dto.category,
      description: dto.description || '',
      storageName: file.filename, // El nombre con el sufijo único
      originalName: file.originalname,
      mimeType: file.mimetype,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      uploadedBy: { id: user.sub },
    });

    return await this.fileRepository.save(newFile);
  }

  // Función para obtener la ruta de un archivo especifico
  getFilePath(fileName: string) {
    const path = join(this.uploadPath, fileName);

    if (!existsSync(path)) {
      throw new BadRequestException(`No se encontró el archivo: ${fileName}`);
    }

    return path;
  }

  async remove(id: number): Promise<{ message: string }> {
    // 1. Buscamos el archivo en la base de datos para obtener el 'storageName'
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException(
        `El archivo con ID ${id} no existe en la base de datos.`,
      );
    }

    // 2. Ruta completa del archivo en el disco
    const filePath = join(this.uploadPath, file.storageName);

    try {
      // 3. Intentamos borrar el archivo físico si existe
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (error) {
      // Opcional: registrar el error si el archivo físico no se pudo borrar
      console.error(
        `Error al borrar archivo físico: ${file.storageName}`,
        error,
      );
    }

    // 4. Borramos el registro de la base de datos
    await this.fileRepository.softDelete(id);

    return { message: `Archivo "${file.title}" eliminado correctamente.` };
  }

  async countAll(): Promise<number> {
    return await this.fileRepository.count();
  }

  async findRecent() {
    return await this.fileRepository.find({
      relations: {
        uploadedBy: true, // 👈 Cambiado 'user' por 'uploadedBy'
      },
      order: {
        createdAt: 'DESC',
      },
      take: 5,
    });
  }
}

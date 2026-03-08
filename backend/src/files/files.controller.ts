import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/interfaces/roles.enum';
import { FileUploadDto } from './dto/file-upload.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FilesService } from './files.service';
import { createReadStream } from 'fs';
import { User } from 'src/users/entities/user.entity';
import * as express from 'express';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('recent')
  @Roles(Role.ADMIN, Role.GERENTE, Role.EMPLEADO) // Todos pueden ver qué hay de nuevo
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getRecentActivity() {
    return await this.filesService.findRecent();
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  async getCount() {
    const count = await this.filesService.countAll();
    return { count };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.filesService.findAll();
  }

  @Get('view/:filename')
  @Public()
  viewFile(@Param('filename') filename: string, @Res() res: express.Response) {
    const path = this.filesService.getFilePath(filename);
    const mimeType = this.getMimeType(filename);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // 'inline' le dice al navegador que intente mostrar el archivo en lugar de descargarlo
    return res.sendFile(path, (err) => {
      if (err) {
        res.status(404).json({ message: 'Archivo no encontrado' });
      }
    });
  }

  // Método auxiliar para asegurar el Content-Type (opcional)
  private getMimeType(filename: string): string {
    const ext = extname(filename).toLowerCase();
    const mimetypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.mp4': 'video/mp4',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.pptx':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.ppt': 'application/vnd.ms-powerpoint',
    };

    return mimetypes[ext] || 'application/octet-stream';
  }

  @Post('upload')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 50 })],
      }),
    )
    file: Express.Multer.File,
    @Body() fileUploadDto: FileUploadDto,
    @Req() req: express.Request,
  ) {
    console.log('Usuario en Request:', req.user); // <--- DEBUGEA ESTO
    const allowedMimeTypes = [
      // Documentos PDF
      'application/pdf',
      // Microsoft Office
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint', // .ppt
      // Video y Audio
      'video/mp4',
      'audio/mpeg',
      // Archivos comprimidos (Opcional, útil para desarrolladores)
      'application/zip',
      'application/x-rar-compressed',
    ];

    // Permitir todas las imágenes
    const isImage = file.mimetype.startsWith('image/');
    const isAllowed = allowedMimeTypes.includes(file.mimetype) || isImage;

    if (!isAllowed) {
      throw new BadRequestException(
        `Formato no soportado (${file.mimetype}). NEXUS acepta Office, PDF, Imágenes, MP4 y ZIP.`,
      );
    }
    const user = req.user as User;
    const savedMetadata = await this.filesService.registerFileData(
      file,
      fileUploadDto,
      user,
    );
    return {
      message: 'Archivo y datos guardados correctamente',
      data: savedMetadata,
      fileInfo: {
        originalName: file.originalname,
        storageName: file.filename,
        type: file.mimetype,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      },
      metaData: fileUploadDto, // Aquí tienes el título, categoría, etc.
    };
  }

  @Get(':fileName')
  @UseGuards(JwtAuthGuard)
  getFile(
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) res: express.Response,
  ): StreamableFile {
    const path = this.filesService.getFilePath(fileName);
    const file = createReadStream(path);
    res.set({
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Content-Type': 'application/octet-stream',
    });
    return new StreamableFile(file);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.filesService.remove(id);
    return { message: `Endpoint de borrado para ID ${id} listo` };
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Hasher } from 'src/common/utils/auth';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async countActive(): Promise<number> {
    return await this.userRepository.count();
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;
    const existingUser = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
    if (existingUser) {
      throw new ConflictException(
        'El correo electrónico ya está registrado el sistema',
      );
    }

    const hashedPassword = await Hasher.hashPassword(password);

    const newUser = this.userRepository.create({
      ...createUserDto,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password: hashedPassword,
    });
    return await this.userRepository.save(newUser);
  }

  async update(
    id: number,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Si viene un password, lo hasheamos antes de guardar
    if (updateUserDto.password) {
      updateUserDto.password = await Hasher.hashPassword(
        updateUserDto.password,
      );
    }

    const updatedUser = await this.userRepository.save({
      ...user,
      ...updateUserDto,
    });

    const result = await this.userRepository.findOne({
      where: { id: updatedUser.id },
      relations: ['area'],
    });
    if (!result) {
      throw new NotFoundException('Error al recuperar el usuario actualizado');
    }
    return result;
  }

  async findAll() {
    return await this.userRepository.find({
      relations: ['area'],
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'role',
        'createdAt',
        'area',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      relations: {
        area: true,
      },
      select: [
        'id',
        'email',
        'password',
        'role',
        'firstName',
        'lastName',
        'area',
      ],
    });
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    await this.userRepository.delete(user);
    return {
      message: `Usuario ${user.email} movido a la papelera correctamente`,
      id,
    };
  }
}

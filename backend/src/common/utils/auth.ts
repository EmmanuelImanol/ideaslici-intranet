import * as bcrypt from 'bcrypt';

export class Hasher {
  private static readonly SALT_ROUNDS = 10;

  static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  }

  static async checkPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}

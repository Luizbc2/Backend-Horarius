import { AuthenticatedUser } from "../auth.types";
import { UserModel } from "../models/user.model";
import { UserRepository } from "./user.repository";

export class SequelizeUserRepository implements UserRepository {
  public async findByEmail(email: string): Promise<AuthenticatedUser | null> {
    const user = await UserModel.findOne({
      where: {
        email: email.toLowerCase()
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      password: user.password
    };
  }
}

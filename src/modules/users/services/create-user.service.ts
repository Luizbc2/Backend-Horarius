import {
  CreateUserInputDto,
  CreateUserResponseDto,
  PublicUserDto,
} from "../dtos/create-user.dto";
import { UniqueConstraintError, ValidationError } from "sequelize";
import { UserRepository } from "../../auth/repositories/user.repository";
import { isValidEmail } from "../../../shared/utils/email.util";
import { isValidCpf, normalizeCpf } from "../../../shared/utils/cpf.util";
import { validatePasswordStrength } from "../../../shared/utils/password-strength.util";
import { hashPassword } from "../../auth/utils/password.util";

type CreateUserServiceResult =
  | {
      success: true;
      data: CreateUserResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class CreateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(input: CreateUserInputDto): Promise<CreateUserServiceResult> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const cpf = normalizeCpf(input.cpf);
    const password = input.password.trim();

    if (!name || !email || !cpf || !password) {
      return {
        success: false,
        message: "Name, email, CPF and password are required.",
        statusCode: 400,
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: "Invalid email format.",
        statusCode: 400,
      };
    }

    if (!isValidCpf(cpf)) {
      return {
        success: false,
        message: "Invalid CPF.",
        statusCode: 400,
      };
    }

    const passwordValidationMessage = validatePasswordStrength(password);

    if (passwordValidationMessage) {
      return {
        success: false,
        message: passwordValidationMessage,
        statusCode: 400,
      };
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      return {
        success: false,
        message: "Email is already in use.",
        statusCode: 409,
      };
    }

    const existingCpfUser = await this.userRepository.findByCpf(cpf);

    if (existingCpfUser) {
      return {
        success: false,
        message: "CPF is already in use.",
        statusCode: 409,
      };
    }

    try {
      const createdUser = await this.userRepository.create({
        name,
        email,
        cpf,
        password: await hashPassword(password),
      });

      return {
        success: true,
        data: {
          message: "User registered successfully.",
          user: this.toPublicUser(createdUser),
        },
      };
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return {
          success: false,
          message: this.getUniqueConstraintMessage(error),
          statusCode: 409,
        };
      }

      if (error instanceof ValidationError) {
        return {
          success: false,
          message: "Invalid user data.",
          statusCode: 400,
        };
      }

      throw error;
    }
  }

  private toPublicUser(user: PublicUserDto): PublicUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
    };
  }

  private getUniqueConstraintMessage(error: UniqueConstraintError): string {
    const fields = error.errors.map((item) => item.path);

    if (fields.includes("email")) {
      return "Email is already in use.";
    }

    if (fields.includes("cpf")) {
      return "CPF is already in use.";
    }

    return "User data conflicts with an existing record.";
  }
}

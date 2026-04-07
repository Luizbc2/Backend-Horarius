import { ValidationError } from "sequelize";

import { isValidEmail } from "../../../shared/utils/email.util";
import { CreateProfessionalRequestDto, ProfessionalDto } from "../dtos/professional.dto";
import { ProfessionalRepository } from "../repositories/professional.repository";

type CreateProfessionalResponseDto = {
  message: string;
  professional: ProfessionalDto;
};

type CreateProfessionalServiceResult =
  | {
      success: true;
      data: CreateProfessionalResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class CreateProfessionalService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(input: CreateProfessionalRequestDto): Promise<CreateProfessionalServiceResult> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const specialty = input.specialty.trim();
    const status = input.status.trim().toLowerCase();

    if (!name || !email || !phone || !specialty || !status) {
      return {
        success: false,
        message: "Nome, email, telefone, especialidade e status sao obrigatorios.",
        statusCode: 400,
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: "Formato de email invalido.",
        statusCode: 400,
      };
    }

    try {
      const createdProfessional = await this.professionalRepository.create({
        name,
        email,
        phone,
        specialty,
        status,
      });

      return {
        success: true,
        data: {
          message: "Profissional cadastrado com sucesso.",
          professional: createdProfessional,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          message: "Dados do profissional sao invalidos.",
          statusCode: 400,
        };
      }

      throw error;
    }
  }
}

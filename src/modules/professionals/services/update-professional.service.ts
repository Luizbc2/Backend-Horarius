import { ValidationError } from "sequelize";

import { isValidEmail } from "../../../shared/utils/email.util";
import { ProfessionalDto, UpdateProfessionalRequestDto } from "../dtos/professional.dto";
import { ProfessionalRepository } from "../repositories/professional.repository";

type UpdateProfessionalResponseDto = {
  message: string;
  professional: ProfessionalDto;
};

type UpdateProfessionalServiceResult =
  | {
      success: true;
      data: UpdateProfessionalResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class UpdateProfessionalService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(id: number, input: UpdateProfessionalRequestDto): Promise<UpdateProfessionalServiceResult> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const specialty = input.specialty.trim();
    const status = input.status.trim().toLowerCase();

    if (!id || !name || !email || !phone || !specialty || !status) {
      return {
        success: false,
        message: "Id, nome, email, telefone, especialidade e status sao obrigatorios.",
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
      const updatedProfessional = await this.professionalRepository.update(id, {
        name,
        email,
        phone,
        specialty,
        status,
      });

      if (!updatedProfessional) {
        return {
          success: false,
          message: "Profissional nao encontrado.",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: {
          message: "Profissional atualizado com sucesso.",
          professional: updatedProfessional,
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

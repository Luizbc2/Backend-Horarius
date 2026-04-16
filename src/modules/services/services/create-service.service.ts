import { ValidationError } from "sequelize";

import {
  hasTextLengthBetween,
  INPUT_LIMITS,
  isNonNegativeAmount,
  isPositiveInteger,
  normalizeMultiLineText,
  normalizeSingleLineText,
} from "../../../shared/utils/input-validation.util";
import { CreateServiceRequestDto, ServiceDto } from "../dtos/service.dto";
import { ServiceRepository } from "../repositories/service.repository";

type CreateServiceResponseDto = {
  message: string;
  service: ServiceDto;
};

type CreateServiceServiceResult =
  | {
      success: true;
      data: CreateServiceResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class CreateServiceService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(input: CreateServiceRequestDto): Promise<CreateServiceServiceResult> {
    const name = normalizeSingleLineText(input.name, INPUT_LIMITS.name);
    const category = normalizeSingleLineText(input.category, INPUT_LIMITS.category);
    const description = normalizeMultiLineText(input.description, INPUT_LIMITS.description);
    const durationMinutes = Number(input.durationMinutes);
    const price = Number(input.price);

    if (!name || !category || !description || !durationMinutes || Number.isNaN(price)) {
      return {
        success: false,
        message: "Nome, categoria, duracao, preco e descricao sao obrigatorios.",
        statusCode: 400,
      };
    }

    if (!hasTextLengthBetween(name, 2, INPUT_LIMITS.name)) {
      return {
        success: false,
        message: "O nome do servico deve ter entre 2 e 120 caracteres.",
        statusCode: 400,
      };
    }

    if (!hasTextLengthBetween(category, 2, INPUT_LIMITS.category)) {
      return {
        success: false,
        message: "A categoria do servico deve ter entre 2 e 80 caracteres.",
        statusCode: 400,
      };
    }

    if (!hasTextLengthBetween(description, 5, INPUT_LIMITS.description)) {
      return {
        success: false,
        message: "A descricao do servico deve ter entre 5 e 500 caracteres.",
        statusCode: 400,
      };
    }

    if (!isPositiveInteger(durationMinutes, 1440)) {
      return {
        success: false,
        message: "A duracao do servico deve ser um numero inteiro entre 1 e 1440.",
        statusCode: 400,
      };
    }

    if (!isNonNegativeAmount(price, 99999.99)) {
      return {
        success: false,
        message: "O preco do servico deve ser um valor entre 0 e 99999.99.",
        statusCode: 400,
      };
    }

    try {
      const createdService = await this.serviceRepository.create({
        name,
        category,
        durationMinutes,
        price,
        description,
      });

      return {
        success: true,
        data: {
          message: "Servico cadastrado com sucesso.",
          service: createdService,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          message: "Dados do servico sao invalidos.",
          statusCode: 400,
        };
      }

      throw error;
    }
  }
}

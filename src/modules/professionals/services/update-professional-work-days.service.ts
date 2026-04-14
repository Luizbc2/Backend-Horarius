import { ValidationError } from "sequelize";

import {
  ProfessionalWorkDayDto,
  ProfessionalWorkDayInputDto,
  UpdateProfessionalWorkDaysRequestDto,
} from "../dtos/professional.dto";
import { ProfessionalRepository } from "../repositories/professional.repository";

type UpdateProfessionalWorkDaysResponseDto = {
  message: string;
  workDays: ProfessionalWorkDayDto[];
};

type UpdateProfessionalWorkDaysServiceResult =
  | {
      success: true;
      data: UpdateProfessionalWorkDaysResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

const VALID_WEEK_DAYS = new Set([
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
]);

export class UpdateProfessionalWorkDaysService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(
    professionalId: number,
    input: UpdateProfessionalWorkDaysRequestDto,
  ): Promise<UpdateProfessionalWorkDaysServiceResult> {
    if (!professionalId) {
      return {
        success: false,
        message: "Id do profissional e obrigatorio.",
        statusCode: 400,
      };
    }

    if (!Array.isArray(input.workDays)) {
      return {
        success: false,
        message: "A lista de horarios do profissional e obrigatoria.",
        statusCode: 400,
      };
    }

    const normalizedWorkDays = this.normalizeWorkDays(input.workDays);
    const validationMessage = this.validateWorkDays(normalizedWorkDays);

    if (validationMessage) {
      return {
        success: false,
        message: validationMessage,
        statusCode: 400,
      };
    }

    try {
      const workDays = await this.professionalRepository.replaceWorkDays(
        professionalId,
        normalizedWorkDays,
      );

      if (workDays === null) {
        return {
          success: false,
          message: "Profissional nao encontrado.",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: {
          message: "Horarios do profissional atualizados com sucesso.",
          workDays,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          message: "Dados dos horarios do profissional sao invalidos.",
          statusCode: 400,
        };
      }

      throw error;
    }
  }

  private normalizeWorkDays(workDays: ProfessionalWorkDayInputDto[]): ProfessionalWorkDayInputDto[] {
    return workDays.map((workDay) => ({
      dayOfWeek: workDay.dayOfWeek.trim().toLowerCase(),
      enabled: Boolean(workDay.enabled),
      startTime: workDay.startTime.trim(),
      endTime: workDay.endTime.trim(),
      breakStart: workDay.breakStart?.trim() || null,
      breakEnd: workDay.breakEnd?.trim() || null,
    }));
  }

  private validateWorkDays(workDays: ProfessionalWorkDayInputDto[]): string | null {
    const usedDays = new Set<string>();

    for (const workDay of workDays) {
      if (!VALID_WEEK_DAYS.has(workDay.dayOfWeek)) {
        return "Dia da semana invalido nos horarios do profissional.";
      }

      if (usedDays.has(workDay.dayOfWeek)) {
        return "Nao e permitido repetir o mesmo dia da semana.";
      }

      usedDays.add(workDay.dayOfWeek);

      if (!workDay.startTime || !workDay.endTime) {
        return "Horario inicial e final sao obrigatorios em todos os dias informados.";
      }
    }

    return null;
  }
}

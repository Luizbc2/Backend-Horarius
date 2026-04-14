import { ProfessionalWorkDayDto } from "../dtos/professional.dto";
import { ProfessionalRepository } from "../repositories/professional.repository";

type ListProfessionalWorkDaysResponseDto = {
  data: ProfessionalWorkDayDto[];
};

type ListProfessionalWorkDaysServiceResult =
  | {
      success: true;
      data: ListProfessionalWorkDaysResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class ListProfessionalWorkDaysService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(professionalId: number): Promise<ListProfessionalWorkDaysServiceResult> {
    if (!professionalId) {
      return {
        success: false,
        message: "Id do profissional e obrigatorio.",
        statusCode: 400,
      };
    }

    const workDays = await this.professionalRepository.findWorkDaysByProfessionalId(professionalId);

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
        data: workDays,
      },
    };
  }
}

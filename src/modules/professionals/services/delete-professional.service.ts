import { ProfessionalRepository } from "../repositories/professional.repository";

type DeleteProfessionalResponseDto = {
  message: string;
};

type DeleteProfessionalServiceResult =
  | {
      success: true;
      data: DeleteProfessionalResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class DeleteProfessionalService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(id: number): Promise<DeleteProfessionalServiceResult> {
    if (!id) {
      return {
        success: false,
        message: "Id do profissional é obrigatório.",
        statusCode: 400,
      };
    }

    const deleted = await this.professionalRepository.delete(id);

    if (!deleted) {
      return {
        success: false,
        message: "Profissional não encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        message: "Profissional excluido com sucesso.",
      },
    };
  }
}


import { ServiceDto } from "../dtos/service.dto";
import { ServiceRepository } from "../repositories/service.repository";

type GetServiceResponseDto = {
  service: ServiceDto;
};

type GetServiceServiceResult =
  | {
      success: true;
      data: GetServiceResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class GetServiceService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(id: number): Promise<GetServiceServiceResult> {
    if (!id) {
      return {
        success: false,
        message: "Id do serviço é obrigatório.",
        statusCode: 400,
      };
    }

    const service = await this.serviceRepository.findById(id);

    if (!service) {
      return {
        success: false,
        message: "Serviço não encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        service,
      },
    };
  }
}


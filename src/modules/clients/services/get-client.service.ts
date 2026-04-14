import { ClientDto } from "../dtos/client.dto";
import { ClientRepository } from "../repositories/client.repository";

type GetClientResponseDto = {
  client: ClientDto;
};

type GetClientServiceResult =
  | {
      success: true;
      data: GetClientResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class GetClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  public async execute(id: number): Promise<GetClientServiceResult> {
    if (!id) {
      return {
        success: false,
        message: "Id do cliente e obrigatorio.",
        statusCode: 400,
      };
    }

    const client = await this.clientRepository.findById(id);

    if (!client) {
      return {
        success: false,
        message: "Cliente nao encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        client,
      },
    };
  }
}

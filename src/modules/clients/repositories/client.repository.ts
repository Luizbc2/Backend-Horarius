import {
  ClientDto,
  CreateClientRequestDto,
  ListClientsQueryDto,
  UpdateClientRequestDto
} from "../dtos/client.dto";

export type ListClientsRepositoryResult = {
  clients: ClientDto[];
  totalItems: number;
};

export interface ClientRepository {
  findById(id: number): Promise<ClientDto | null>;
  list(query: Required<ListClientsQueryDto> & { limit: number }): Promise<ListClientsRepositoryResult>;
  create(input: CreateClientRequestDto): Promise<ClientDto>;
  update(id: number, input: UpdateClientRequestDto): Promise<ClientDto | null>;
  delete(id: number): Promise<boolean>;
}

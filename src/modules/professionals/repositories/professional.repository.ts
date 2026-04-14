import {
  CreateProfessionalRequestDto,
  ProfessionalWorkDayDto,
  ProfessionalWorkDayInputDto,
  ListProfessionalsQueryDto,
  ProfessionalDto,
  UpdateProfessionalRequestDto,
} from "../dtos/professional.dto";

export type ListProfessionalsRepositoryResult = {
  professionals: ProfessionalDto[];
  totalItems: number;
};

export interface ProfessionalRepository {
  findById(id: number): Promise<ProfessionalDto | null>;
  findWorkDaysByProfessionalId(professionalId: number): Promise<ProfessionalWorkDayDto[] | null>;
  list(query: Required<ListProfessionalsQueryDto> & { limit: number }): Promise<ListProfessionalsRepositoryResult>;
  create(input: CreateProfessionalRequestDto): Promise<ProfessionalDto>;
  update(id: number, input: UpdateProfessionalRequestDto): Promise<ProfessionalDto | null>;
  replaceWorkDays(
    professionalId: number,
    workDays: ProfessionalWorkDayInputDto[],
  ): Promise<ProfessionalWorkDayDto[] | null>;
  delete(id: number): Promise<boolean>;
}

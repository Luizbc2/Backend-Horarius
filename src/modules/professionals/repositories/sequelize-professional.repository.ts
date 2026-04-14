import { Op } from "sequelize";

import {
  CreateProfessionalRequestDto,
  ProfessionalWorkDayDto,
  ProfessionalWorkDayInputDto,
  ProfessionalDto,
  UpdateProfessionalRequestDto,
} from "../dtos/professional.dto";
import { ProfessionalModel } from "../models/professional.model";
import { ProfessionalWorkDayModel } from "../models/professional-work-day.model";
import { ListProfessionalsRepositoryResult, ProfessionalRepository } from "./professional.repository";

type ListProfessionalsInput = {
  page: number;
  limit: number;
  search: string;
};

export class SequelizeProfessionalRepository implements ProfessionalRepository {
  public async findById(id: number): Promise<ProfessionalDto | null> {
    const professional = await ProfessionalModel.findByPk(id);

    if (!professional) {
      return null;
    }

    return this.toProfessionalDto(professional);
  }

  public async findWorkDaysByProfessionalId(professionalId: number): Promise<ProfessionalWorkDayDto[] | null> {
    const professional = await ProfessionalModel.findByPk(professionalId);

    if (!professional) {
      return null;
    }

    const workDays = await ProfessionalWorkDayModel.findAll({
      where: {
        professionalId,
      },
      order: [["id", "ASC"]],
    });

    return workDays.map((workDay) => this.toProfessionalWorkDayDto(workDay));
  }

  public async list(query: ListProfessionalsInput): Promise<ListProfessionalsRepositoryResult> {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, query.limit);
    const search = query.search.trim().toLowerCase();

    const { rows, count } = await ProfessionalModel.findAndCountAll({
      where: search
        ? {
            [Op.or]: [
              {
                name: {
                  [Op.iLike]: `%${search}%`,
                },
              },
              {
                email: {
                  [Op.iLike]: `%${search}%`,
                },
              },
              {
                phone: {
                  [Op.iLike]: `%${search}%`,
                },
              },
              {
                specialty: {
                  [Op.iLike]: `%${search}%`,
                },
              },
              {
                status: {
                  [Op.iLike]: `%${search}%`,
                },
              },
            ],
          }
        : undefined,
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    return {
      professionals: rows.map((professional) => this.toProfessionalDto(professional)),
      totalItems: count,
    };
  }

  public async create(input: CreateProfessionalRequestDto): Promise<ProfessionalDto> {
    const professional = await ProfessionalModel.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      specialty: input.specialty,
      status: input.status,
    });

    return this.toProfessionalDto(professional);
  }

  public async update(id: number, input: UpdateProfessionalRequestDto): Promise<ProfessionalDto | null> {
    const professional = await ProfessionalModel.findByPk(id);

    if (!professional) {
      return null;
    }

    professional.name = input.name;
    professional.email = input.email;
    professional.phone = input.phone;
    professional.specialty = input.specialty;
    professional.status = input.status;

    await professional.save();

    return this.toProfessionalDto(professional);
  }

  public async replaceWorkDays(
    professionalId: number,
    workDays: ProfessionalWorkDayInputDto[],
  ): Promise<ProfessionalWorkDayDto[] | null> {
    const professional = await ProfessionalModel.findByPk(professionalId);

    if (!professional) {
      return null;
    }

    const sequelize = ProfessionalModel.sequelize;

    if (!sequelize) {
      throw new Error("Professional model is not connected to Sequelize.");
    }

    await sequelize.transaction(async (transaction) => {
      await ProfessionalWorkDayModel.destroy({
        where: {
          professionalId,
        },
        transaction,
      });

      if (workDays.length === 0) {
        return;
      }

      await ProfessionalWorkDayModel.bulkCreate(
        workDays.map((workDay) => ({
          professionalId,
          dayOfWeek: workDay.dayOfWeek,
          enabled: workDay.enabled,
          startTime: workDay.startTime,
          endTime: workDay.endTime,
          breakStart: workDay.breakStart ?? null,
          breakEnd: workDay.breakEnd ?? null,
        })),
        {
          transaction,
        },
      );
    });

    const savedWorkDays = await ProfessionalWorkDayModel.findAll({
      where: {
        professionalId,
      },
      order: [["id", "ASC"]],
    });

    return savedWorkDays.map((workDay) => this.toProfessionalWorkDayDto(workDay));
  }

  public async delete(id: number): Promise<boolean> {
    const deletedCount = await ProfessionalModel.destroy({
      where: {
        id,
      },
    });

    return deletedCount > 0;
  }

  private toProfessionalDto(professional: ProfessionalModel): ProfessionalDto {
    return {
      id: professional.id,
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      specialty: professional.specialty,
      status: professional.status,
    };
  }

  private toProfessionalWorkDayDto(workDay: ProfessionalWorkDayModel): ProfessionalWorkDayDto {
    return {
      id: workDay.id,
      professionalId: workDay.professionalId,
      dayOfWeek: workDay.dayOfWeek,
      enabled: workDay.enabled,
      startTime: workDay.startTime,
      endTime: workDay.endTime,
      breakStart: workDay.breakStart,
      breakEnd: workDay.breakEnd,
    };
  }
}

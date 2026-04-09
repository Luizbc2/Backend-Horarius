import {
  AppointmentDto,
  CreateAppointmentRequestDto,
  ListAppointmentsQueryDto,
  UpdateAppointmentRequestDto,
} from "../dtos/appointment.dto";

export type ListAppointmentsRepositoryResult = {
  appointments: AppointmentDto[];
  totalItems: number;
};

export interface AppointmentRepository {
  findById(id: number): Promise<AppointmentDto | null>;
  list(query: Required<Pick<ListAppointmentsQueryDto, "page" | "limit">> & Omit<ListAppointmentsQueryDto, "page" | "limit">): Promise<ListAppointmentsRepositoryResult>;
  create(input: CreateAppointmentRequestDto): Promise<AppointmentDto>;
  update(id: number, input: UpdateAppointmentRequestDto): Promise<AppointmentDto | null>;
  delete(id: number): Promise<boolean>;
}

import {
  AppointmentDto,
  CreateAppointmentRequestDto,
  ListAppointmentsQueryDto,
  UpdateAppointmentRequestDto,
} from "../../modules/appointments/dtos/appointment.dto";
import {
  AppointmentRepository,
  ListAppointmentsRepositoryResult,
} from "../../modules/appointments/repositories/appointment.repository";

type InMemoryAppointmentRepositoryOptions = {
  appointments?: AppointmentDto[];
};

export class InMemoryAppointmentRepository implements AppointmentRepository {
  private readonly appointments: AppointmentDto[];
  private nextId: number;

  constructor(options: InMemoryAppointmentRepositoryOptions = {}) {
    this.appointments = options.appointments ? [...options.appointments] : [];
    this.nextId = this.appointments.reduce((highestId, appointment) => Math.max(highestId, appointment.id), 0) + 1;
  }

  public async findById(id: number): Promise<AppointmentDto | null> {
    return this.appointments.find((appointment) => appointment.id === id) ?? null;
  }

  public async list(
    query: Required<Pick<ListAppointmentsQueryDto, "page" | "limit">> &
      Omit<ListAppointmentsQueryDto, "page" | "limit">,
  ): Promise<ListAppointmentsRepositoryResult> {
    const filteredAppointments = this.appointments.filter((appointment) => {
      if (query.professionalId && appointment.professionalId !== query.professionalId) {
        return false;
      }

      if (query.status && appointment.status !== query.status) {
        return false;
      }

      if (query.date) {
        const appointmentDate = appointment.scheduledAt.slice(0, 10);

        if (appointmentDate !== query.date) {
          return false;
        }
      }

      return true;
    });
    const startIndex = (query.page - 1) * query.limit;

    return {
      appointments: filteredAppointments.slice(startIndex, startIndex + query.limit),
      totalItems: filteredAppointments.length,
    };
  }

  public async create(input: CreateAppointmentRequestDto): Promise<AppointmentDto> {
    const createdAppointment: AppointmentDto = {
      id: this.nextId++,
      clientId: input.clientId,
      clientName: `Cliente ${input.clientId}`,
      professionalId: input.professionalId,
      professionalName: `Profissional ${input.professionalId}`,
      serviceId: input.serviceId,
      serviceName: `Servico ${input.serviceId}`,
      scheduledAt: input.scheduledAt,
      status: input.status,
      notes: input.notes,
    };

    this.appointments.push(createdAppointment);

    return createdAppointment;
  }

  public async update(id: number, input: UpdateAppointmentRequestDto): Promise<AppointmentDto | null> {
    const appointmentIndex = this.appointments.findIndex((appointment) => appointment.id === id);

    if (appointmentIndex === -1) {
      return null;
    }

    const currentAppointment = this.appointments[appointmentIndex];

    if (!currentAppointment) {
      return null;
    }

    const updatedAppointment: AppointmentDto = {
      ...currentAppointment,
      clientId: input.clientId,
      clientName: `Cliente ${input.clientId}`,
      professionalId: input.professionalId,
      professionalName: `Profissional ${input.professionalId}`,
      serviceId: input.serviceId,
      serviceName: `Servico ${input.serviceId}`,
      scheduledAt: input.scheduledAt,
      status: input.status,
      notes: input.notes,
    };

    this.appointments[appointmentIndex] = updatedAppointment;

    return updatedAppointment;
  }

  public async delete(id: number): Promise<boolean> {
    const appointmentIndex = this.appointments.findIndex((appointment) => appointment.id === id);

    if (appointmentIndex === -1) {
      return false;
    }

    this.appointments.splice(appointmentIndex, 1);
    return true;
  }
}

import { AppointmentRepository } from "../repositories/appointment.repository";

type DeleteAppointmentResponseDto = {
  message: string;
};

type DeleteAppointmentServiceResult =
  | {
      success: true;
      data: DeleteAppointmentResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class DeleteAppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  public async execute(id: number): Promise<DeleteAppointmentServiceResult> {
    if (!id) {
      return {
        success: false,
        message: "Id do agendamento é obrigatório.",
        statusCode: 400,
      };
    }

    const deleted = await this.appointmentRepository.delete(id);

    if (!deleted) {
      return {
        success: false,
        message: "Agendamento não encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        message: "Agendamento excluido com sucesso.",
      },
    };
  }
}


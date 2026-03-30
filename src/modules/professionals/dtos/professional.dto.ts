export type ProfessionalDto = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  shiftStart: string;
  shiftEnd: string;
  status: string;
};

export type CreateProfessionalRequestDto = {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  shiftStart: string;
  shiftEnd: string;
  status: string;
};

export type UpdateProfessionalRequestDto = {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  shiftStart: string;
  shiftEnd: string;
  status: string;
};

export type ListProfessionalsQueryDto = {
  page?: number;
  search?: string;
};

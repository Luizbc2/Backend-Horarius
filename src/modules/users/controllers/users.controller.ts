import { Request, Response } from "express";

import { CreateUserService } from "../services/create-user.service";
import { CreateUserRequestDto } from "../dtos/create-user.dto";

export class UsersController {
  constructor(private readonly createUserService: CreateUserService) {}

  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const {
        name = "",
        email = "",
        cpf = "",
        password = "",
      } = request.body as Partial<CreateUserRequestDto>;

      const result = await this.createUserService.execute({
        name,
        email,
        cpf,
        password,
      });

      if (!result.success) {
        return response.status(result.statusCode).json({
          message: result.message,
        });
      }

      return response.status(201).json(result.data);
    } catch (error) {
      console.error("User registration request failed.", error);

      return response.status(500).json({
        message: "Unable to process user registration right now.",
      });
    }
  }
}

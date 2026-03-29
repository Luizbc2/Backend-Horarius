import { Request, Response } from "express";

import { CreateUserService } from "../services/create-user.service";
import { CreateUserRequestDto } from "../dtos/create-user.dto";

export class UsersController {
  constructor(private readonly createUserService: CreateUserService) {}

  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const result = await this.createUserService.execute({
        name: this.asString((request.body as Partial<CreateUserRequestDto>).name),
        email: this.asString((request.body as Partial<CreateUserRequestDto>).email),
        cpf: this.asString((request.body as Partial<CreateUserRequestDto>).cpf),
        password: this.asString((request.body as Partial<CreateUserRequestDto>).password),
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

  private asString(value: unknown): string {
    return typeof value === "string" ? value : "";
  }
}

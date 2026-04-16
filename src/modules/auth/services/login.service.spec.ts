import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { env } from "../../../config/env";
import { LoginService } from "./login.service";
import { hashPassword } from "../utils/password.util";
import { InMemoryUserRepository } from "../../../test/mocks/in-memory-user.repository";

test("LoginService returns JWT and public user data for valid credentials", async () => {
  const repository = new InMemoryUserRepository({
    users: [
      {
        id: 7,
        name: "Luiz",
        email: "luiz@horarius.com",
        cpf: "52998224725",
        password: await hashPassword("Senha123"),
      },
    ],
  });
  const service = new LoginService(repository);

  const result = await service.execute({
    email: "  Luiz@Horarius.com ",
    password: "Senha123",
  });

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  const tokenPayload = jwt.verify(result.data.token, env.jwt.secret) as { sub: string; email: string };

  assert.equal(result.data.message, "Login realizado com sucesso.");
  assert.equal(result.data.user.id, 7);
  assert.equal(result.data.user.email, "luiz@horarius.com");
  assert.equal(tokenPayload.sub, "7");
  assert.equal(tokenPayload.email, "luiz@horarius.com");
});

test("LoginService rejects invalid email format", async () => {
  const repository = new InMemoryUserRepository();
  const service = new LoginService(repository);

  const result = await service.execute({
    email: "email-invalido",
    password: "Senha123",
  });

  assert.deepEqual(result, {
    success: false,
    message: "Formato de e-mail invalido.",
    statusCode: 400,
  });
});

test("LoginService rejects unknown user", async () => {
  const repository = new InMemoryUserRepository();
  const service = new LoginService(repository);

  const result = await service.execute({
    email: "teste@horarius.com",
    password: "Senha123",
  });

  assert.deepEqual(result, {
    success: false,
    message: "E-mail ou senha invalidos.",
    statusCode: 401,
  });
});

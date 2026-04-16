import test from "node:test";
import assert from "node:assert/strict";

import { CreateUserService } from "./create-user.service";
import { comparePassword } from "../../auth/utils/password.util";
import { InMemoryUserRepository } from "../../../test/mocks/in-memory-user.repository";

test("CreateUserService creates a user with hashed password", async () => {
  const repository = new InMemoryUserRepository();
  const service = new CreateUserService(repository);

  const result = await service.execute({
    name: "  Luiz Otavio  ",
    email: "  LUIZ@HORARIUS.COM ",
    cpf: "529.982.247-25",
    password: "Senha123",
  });

  assert.equal(result.success, true);
  assert.notEqual(repository.lastCreatedInput?.password, "Senha123");
  assert.equal(await comparePassword("Senha123", repository.lastCreatedInput?.password ?? ""), true);

  if (!result.success) {
    return;
  }

  assert.equal(result.data.user.name, "Luiz Otavio");
  assert.equal(result.data.user.email, "luiz@horarius.com");
  assert.equal(result.data.user.cpf, "52998224725");
});

test("CreateUserService rejects duplicated email", async () => {
  const repository = new InMemoryUserRepository({
    users: [
      {
        id: 1,
        name: "Maria",
        email: "maria@horarius.com",
        cpf: "52998224725",
        password: "scrypt$hash",
      },
    ],
  });
  const service = new CreateUserService(repository);

  const result = await service.execute({
    name: "Joao",
    email: "maria@horarius.com",
    cpf: "11144477735",
    password: "Senha123",
  });

  assert.deepEqual(result, {
    success: false,
    message: "E-mail ja esta em uso.",
    statusCode: 409,
  });
});

test("CreateUserService rejects weak password", async () => {
  const repository = new InMemoryUserRepository();
  const service = new CreateUserService(repository);

  const result = await service.execute({
    name: "Joao",
    email: "joao@horarius.com",
    cpf: "11144477735",
    password: "fraca",
  });

  assert.deepEqual(result, {
    success: false,
    message: "A senha deve ter pelo menos 8 caracteres.",
    statusCode: 400,
  });
});

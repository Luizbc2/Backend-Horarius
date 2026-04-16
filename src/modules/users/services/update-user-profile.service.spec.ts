import test from "node:test";
import assert from "node:assert/strict";

import { UpdateUserProfileService } from "./update-user-profile.service";
import { comparePassword, hashPassword } from "../../auth/utils/password.util";
import { InMemoryUserRepository } from "../../../test/mocks/in-memory-user.repository";

test("UpdateUserProfileService only allows editing the authenticated user", async () => {
  const repository = new InMemoryUserRepository({
    users: [
      {
        id: 1,
        name: "Luiz",
        email: "luiz@horarius.com",
        cpf: "52998224725",
        password: await hashPassword("Senha123"),
      },
    ],
  });
  const service = new UpdateUserProfileService(repository);

  const result = await service.execute({
    authenticatedUserId: 2,
    userId: 1,
    name: "Luiz",
    email: "luiz@horarius.com",
    cpf: "52998224725",
    password: "Senha123",
  });

  assert.deepEqual(result, {
    success: false,
    message: "Voce so pode editar o proprio perfil.",
    statusCode: 403,
  });
});

test("UpdateUserProfileService blocks email changes", async () => {
  const repository = new InMemoryUserRepository({
    users: [
      {
        id: 1,
        name: "Luiz",
        email: "luiz@horarius.com",
        cpf: "52998224725",
        password: await hashPassword("Senha123"),
      },
    ],
  });
  const service = new UpdateUserProfileService(repository);

  const result = await service.execute({
    authenticatedUserId: 1,
    userId: 1,
    name: "Luiz",
    email: "outro@horarius.com",
    cpf: "52998224725",
    password: "Senha123",
  });

  assert.deepEqual(result, {
    success: false,
    message: "O e-mail nao pode ser alterado.",
    statusCode: 400,
  });
});

test("UpdateUserProfileService updates the profile with hashed password", async () => {
  const repository = new InMemoryUserRepository({
    users: [
      {
        id: 1,
        name: "Luiz",
        email: "luiz@horarius.com",
        cpf: "52998224725",
        password: await hashPassword("Senha123"),
      },
    ],
  });
  const service = new UpdateUserProfileService(repository);

  const result = await service.execute({
    authenticatedUserId: 1,
    userId: 1,
    name: "Luiz Otavio",
    email: "luiz@horarius.com",
    cpf: "11144477735",
    password: "NovaSenha123",
  });

  assert.equal(result.success, true);
  assert.notEqual(repository.lastUpdatedInput?.password, "NovaSenha123");
  assert.equal(await comparePassword("NovaSenha123", repository.lastUpdatedInput?.password ?? ""), true);

  if (!result.success) {
    return;
  }

  assert.equal(result.data.message, "Perfil atualizado com sucesso.");
  assert.equal(result.data.user.name, "Luiz Otavio");
  assert.equal(result.data.user.cpf, "11144477735");
});

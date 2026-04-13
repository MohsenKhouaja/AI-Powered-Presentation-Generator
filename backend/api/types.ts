import { contextService } from "./contexts/contexts-service.js";
import { fileService } from "./files/files-service.js";
import { presentationsService } from "./presentations/presentations-service.js";
import { accessService } from "./presentations_access/presentations_access-service.js";
import { usersService } from "./users/users-service.js";

type ServiceInput<T extends (...args: any[]) => unknown> = T extends (
  db: unknown,
  ...args: infer Rest
) => unknown
  ? Rest
  : never;

type ServiceOutput<T extends (...args: any[]) => unknown> = Awaited<
  ReturnType<T>
>;
 


export const types = {
  usersService: {
    signup: {
      path: "signup",
      input: null as unknown as ServiceInput<typeof usersService.signup>,
      output: null as unknown as ServiceOutput<typeof usersService.signup>,
    },
  },
  contextService: {
    create: {
      path: "create",
      input: null as unknown as ServiceInput<typeof contextService.create>,
      output: null as unknown as ServiceOutput<typeof contextService.create>,
    },
    update: {
      path: "update",
      input: null as unknown as ServiceInput<typeof contextService.update>,
      output: null as unknown as ServiceOutput<typeof contextService.update>,
    },
  },
  fileService: {
    createOne: {
      path: "createOne",
      input: null as unknown as ServiceInput<typeof fileService.createOne>,
      output: null as unknown as ServiceOutput<typeof fileService.createOne>,
    },
    createMany: {
      path: "createMany",
      input: null as unknown as ServiceInput<typeof fileService.createMany>,
      output: null as unknown as ServiceOutput<typeof fileService.createMany>,
    },
    deleteMany: {
      path: "deleteMany",
      input: null as unknown as ServiceInput<typeof fileService.deleteMany>,
      output: null as unknown as ServiceOutput<typeof fileService.deleteMany>,
    },
  },
  presentationsService: {
    findMany: {
      path: "findMany",
      input: null as unknown as ServiceInput<
        typeof presentationsService.findMany
      >,
      output: null as unknown as ServiceOutput<
        typeof presentationsService.findMany
      >,
    },
    findOneDetailed: {
      path: "findOneDetailed",
      input: null as unknown as ServiceInput<
        typeof presentationsService.findOneDetailed
      >,
      output: null as unknown as ServiceOutput<
        typeof presentationsService.findOneDetailed
      >,
    },
    create: {
      path: "create",
      input: null as unknown as ServiceInput<
        typeof presentationsService.create
      >,
      output: null as unknown as ServiceOutput<
        typeof presentationsService.create
      >,
    },
    remove: {
      path: "remove",
      input: null as unknown as ServiceInput<
        typeof presentationsService.remove
      >,
      output: null as unknown as ServiceOutput<
        typeof presentationsService.remove
      >,
    },
  },
  accessService: {
    grantAccess: {
      path: "grantAccess",
      input: null as unknown as ServiceInput<typeof accessService.grantAccess>,
      output: null as unknown as ServiceOutput<
        typeof accessService.grantAccess
      >,
    },
    getPresentationAccess: {
      path: "getPresentationAccess",
      input: null as unknown as ServiceInput<
        typeof accessService.getPresentationAccess
      >,
      output: null as unknown as ServiceOutput<
        typeof accessService.getPresentationAccess
      >,
    },
  },
} as const;

import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Cats Controller', () => {
  let controller: CatsController;
  let service: CatsService;
  let app: INestApplication;

  jest.mock('./cats.service');
  const mockService = jest.fn().mockImplementation(() => {
    return { create: jest.fn() };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [{ provide: CatsService, useClass: mockService }],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return 204 when cereate', async () => {
    const name = '123';
    await request(app.getHttpServer()).post('/cats').send({ name }).expect(204);
    expect(service.create).toBeCalledTimes(1);
  });
});

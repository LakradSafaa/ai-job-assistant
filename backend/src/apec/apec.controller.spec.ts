import { Test, TestingModule } from '@nestjs/testing';
import { ApecController } from './apec.controller';

describe('ApecController', () => {
  let controller: ApecController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApecController],
    }).compile();

    controller = module.get<ApecController>(ApecController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

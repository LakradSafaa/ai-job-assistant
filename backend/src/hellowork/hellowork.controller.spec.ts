import { Test, TestingModule } from '@nestjs/testing';
import { HelloworkController } from './hellowork.controller';

describe('HelloworkController', () => {
  let controller: HelloworkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelloworkController],
    }).compile();

    controller = module.get<HelloworkController>(HelloworkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

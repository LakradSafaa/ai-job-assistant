import { Test, TestingModule } from '@nestjs/testing';
import { IndeedController } from './indeed.controller';

describe('IndeedController', () => {
  let controller: IndeedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndeedController],
    }).compile();

    controller = module.get<IndeedController>(IndeedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

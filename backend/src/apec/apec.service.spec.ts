import { Test, TestingModule } from '@nestjs/testing';
import { ApecService } from './apec.service';

describe('ApecService', () => {
  let service: ApecService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApecService],
    }).compile();

    service = module.get<ApecService>(ApecService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

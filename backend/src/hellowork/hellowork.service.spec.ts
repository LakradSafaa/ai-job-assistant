import { Test, TestingModule } from '@nestjs/testing';
import { HelloworkService } from './hellowork.service';

describe('HelloworkService', () => {
  let service: HelloworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelloworkService],
    }).compile();

    service = module.get<HelloworkService>(HelloworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { EnergyLevelsController } from './energy-levels.controller';

describe('EnergyLevelsController', () => {
  let controller: EnergyLevelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnergyLevelsController],
    }).compile();

    controller = module.get<EnergyLevelsController>(EnergyLevelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

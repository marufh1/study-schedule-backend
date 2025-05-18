import { Test, TestingModule } from "@nestjs/testing";
import { EnergyLevelService } from "./energy-levels.service";

describe("EnergyLevelsService", () => {
  let service: EnergyLevelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnergyLevelService],
    }).compile();

    service = module.get<EnergyLevelService>(EnergyLevelService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

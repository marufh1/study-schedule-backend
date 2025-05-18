import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { EnergyLevel } from "./energy-level.schema";
import { EnergyLevelService } from "./energy-levels.service";

@Controller("energy-levels")
export class EnergyLevelController {
  constructor(private readonly energyLevelService: EnergyLevelService) {}

  @Get()
  findAll(): Promise<EnergyLevel[]> {
    return this.energyLevelService.findAll();
  }

  @Get("user/:userId")
  findByUserId(@Param("userId") userId: string): Promise<EnergyLevel[]> {
    return this.energyLevelService.findByUserId(userId);
  }

  @Get("user/:userId/day/:day")
  findByUserIdAndDay(@Param("userId") userId: string, @Param("day") day: string): Promise<EnergyLevel[]> {
    return this.energyLevelService.findByUserIdAndDay(userId, day);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<EnergyLevel | null> {
    return this.energyLevelService.findOne(id);
  }

  @Post()
  create(@Body() energyLevel: Partial<EnergyLevel>): Promise<EnergyLevel> {
    return this.energyLevelService.create(energyLevel);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() energyLevel: Partial<EnergyLevel>): Promise<EnergyLevel | null> {
    return this.energyLevelService.update(id, energyLevel);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.energyLevelService.remove(id);
  }
}

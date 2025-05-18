import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EnergyLevel, EnergyLevelSchema } from "./energy-level.schema";
import { EnergyLevelController } from "./energy-levels.controller";
import { EnergyLevelService } from "./energy-levels.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: EnergyLevel.name, schema: EnergyLevelSchema }])],
  controllers: [EnergyLevelController],
  providers: [EnergyLevelService],
  exports: [EnergyLevelService],
})
export class EnergyLevelModule {}

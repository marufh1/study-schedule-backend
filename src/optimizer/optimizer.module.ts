import { Module } from "@nestjs/common";
import { EnergyLevelModule } from "../energy-levels/energy-levels.module";
import { ScheduleModule } from "../schedules/schedules.module";
import { TaskModule } from "../tasks/tasks.module";
import { OptimizerController } from "./optimizer.controller";
import { OptimizerService } from "./optimizer.service";

@Module({
  imports: [ScheduleModule, TaskModule, EnergyLevelModule],
  controllers: [OptimizerController],
  providers: [OptimizerService],
  exports: [OptimizerService], // Export if needed by other modules
})
export class OptimizerModule {}

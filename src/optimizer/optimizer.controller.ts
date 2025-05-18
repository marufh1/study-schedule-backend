import { Controller, Get, Param, Query } from "@nestjs/common";
import { StudySchedule } from "./algorithms/genetic-algorithm";
import { OptimizerService } from "./optimizer.service";

@Controller("optimizer")
export class OptimizerController {
  constructor(private readonly optimizerService: OptimizerService) {}

  @Get("schedule/:userId")
  async optimizeSchedule(
    @Param("userId") userId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ): Promise<StudySchedule> {
    return this.optimizerService.optimizeStudySchedule(userId, new Date(startDate), new Date(endDate));
  }
}

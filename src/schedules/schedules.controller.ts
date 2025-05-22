import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Schedule } from "./schedule.schema";
import { ScheduleService } from "./schedules.service";

@Controller("schedules")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  findAll(): Promise<Schedule[]> {
    return this.scheduleService.findAll();
  }

  @Get("user/:userId")
  findByUserId(@Param("userId") userId: string): Promise<Schedule[]> {
    return this.scheduleService.findByUserId(userId);
  }

  @Get("user/:userId/exclude/:excludeType")
  findByUserIdExceptType(@Param("userId") userId: string, @Param("excludeType") excludeType: string): Promise<Schedule[]> {
    return this.scheduleService.findByUserIdExceptType(userId, excludeType);
  }

  @Get("user/:userId/date-range")
  findByUserIdAndDateRange(
    @Param("userId") userId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ): Promise<Schedule[]> {
    return this.scheduleService.findByUserIdAndDateRange(userId, new Date(startDate), new Date(endDate));
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<Schedule | null> {
    return this.scheduleService.findOne(id);
  }

  @Post()
  create(@Body() schedule: Partial<Schedule>): Promise<Schedule> {
    return this.scheduleService.create(schedule);
  }

  @Post("bulk")
  createMany(@Body() schedules: Partial<Schedule>[]): Promise<Schedule[]> {
    return this.scheduleService.createMany(schedules);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() schedule: Partial<Schedule>): Promise<Schedule | null> {
    return this.scheduleService.update(id, schedule);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.scheduleService.remove(id);
  }
}

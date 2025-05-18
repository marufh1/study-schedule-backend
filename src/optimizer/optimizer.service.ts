import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { EnergyLevel } from "src/energy-levels/energy-level.schema";
import { Schedule } from "src/schedules/schedule.schema";
import { Task } from "src/tasks/task.schema";
import { EnergyLevelService } from "../energy-levels/energy-levels.service";
import { ScheduleService } from "../schedules/schedules.service";
import { TaskService } from "../tasks/tasks.service";
import { StudySchedule, StudyTask } from "./algorithms/genetic-algorithm";
import { ScheduleOptimizer } from "./algorithms/schedule-optimizer";

@Injectable()
export class OptimizerService {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly taskService: TaskService,
    private readonly energyLevelService: EnergyLevelService
  ) {}

  async optimizeStudySchedule(userId: string, startDate: Date, endDate: Date): Promise<StudySchedule> {
    try {
      // Get user's work and class schedules
      const schedules: Schedule[] = await this.scheduleService.findByUserIdAndDateRange(userId, startDate, endDate);

      // Separate work and class schedules
      const workSchedules = schedules
        .filter((s) => s.type === "WORK")
        .map((s) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          date: s.date,
        }));

      const classSchedules = schedules
        .filter((s) => s.type === "CLASS")
        .map((s) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          date: s.date,
        }));

      // Get user's incomplete tasks
      const tasks: Task[] = await this.taskService.findIncompleteTasksByUserId(userId);
      const studyTasks: StudyTask[] = tasks.map((t) => ({
        id: t._id.toString(),
        title: t.title,
        estimatedHours: t.estimatedHours,
        priority: t.priority,
        dueDate: t.dueDate,
        complexityLevel: t.complexityLevel,
        completed: t.completed,
        subjectArea: t.subjectArea,
      }));

      // Get user's energy levels
      const energyLevels: EnergyLevel[] = await this.energyLevelService.findByUserId(userId);
      const formattedEnergyLevels = energyLevels.map((e) => ({
        day: e.day,
        timeSlot: e.timeSlot,
        level: e.level,
      }));

      // Use the ScheduleOptimizer to generate an optimized schedule
      const optimizedSchedule = ScheduleOptimizer.optimizeSchedule(
        studyTasks,
        workSchedules,
        classSchedules,
        formattedEnergyLevels,
        startDate,
        endDate
      );

      return optimizedSchedule;
    } catch (error) {
      throw new InternalServerErrorException("Failed to optimize study schedule: " + error.message);
    }
  }
}

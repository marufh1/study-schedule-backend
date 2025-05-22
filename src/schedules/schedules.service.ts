import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Schedule, ScheduleDocument } from "./schedule.schema";

@Injectable()
export class ScheduleService {
  constructor(@InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>) {}

  async findAll(): Promise<Schedule[]> {
    return this.scheduleModel.find().exec();
  }

  async findByUserId(userId: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ userId: userId }).exec();
  }

  async findByUserIdExceptType(userId: string, excludeType: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ userId: userId, type: { $ne: excludeType } }).exec();
  }

  async findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Schedule[]> {
    return this.scheduleModel
      .find({
        userId: userId,
        date: { $gte: startDate, $lte: endDate },
      })
      .exec();
  }

  async findOne(id: string): Promise<Schedule | null> {
    return this.scheduleModel.findById(id).exec();
  }

  async create(schedule: Partial<Schedule>): Promise<Schedule> {
    const newSchedule = new this.scheduleModel(schedule);
    return newSchedule.save();
  }

  async createMany(schedules: Partial<Schedule>[]): Promise<Schedule[]> {
    // Ensure all required fields are present
    schedules.forEach((schedule) => {
      if (!schedule.day || !schedule.type || !schedule.startTime || !schedule.endTime || !schedule.date || !schedule.userId) {
        throw new Error("Missing required fields in schedule");
      }
    });
    // Type assertion to help TypeScript understand the return type
    return this.scheduleModel.insertMany(schedules) as unknown as Promise<Schedule[]>;
  }

  async update(id: string, schedule: Partial<Schedule>): Promise<Schedule | null> {
    return this.scheduleModel.findByIdAndUpdate(id, schedule, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.scheduleModel.findByIdAndDelete(id).exec();
  }
}

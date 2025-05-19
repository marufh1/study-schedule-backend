import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Task, TaskDocument } from "./task.schema";

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  async findByUserId(userId: string): Promise<Task[]> {
    return this.taskModel.find({ userId: userId }).exec();
  }

  async findIncompleteTasksByUserId(userId: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({
        userId: userId,
        completed: false,
      })
      .exec();
  }

  async findUpcomingTasksByUserId(userId: string, daysAhead: number = 7): Promise<Task[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return this.taskModel
      .find({
        userId: userId,
        completed: false,
        dueDate: { $gte: today, $lte: futureDate },
      })
      .sort({ dueDate: 1, priority: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Task | null> {
    return this.taskModel.findById(id).exec();
  }

  async create(task: Partial<Task>): Promise<Task> {
    const newTask = new this.taskModel(task);
    return newTask.save();
  }

  async update(id: string, task: Partial<Task>): Promise<Task | null> {
    return this.taskModel.findByIdAndUpdate(id, task, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.taskModel.findByIdAndDelete(id).exec();
  }
}

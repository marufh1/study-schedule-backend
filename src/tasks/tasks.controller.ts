import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Task } from "./task.schema";
import { TaskService } from "./tasks.service";

@Controller("tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Get("user/:userId")
  findByUserId(@Param("userId") userId: string): Promise<Task[]> {
    return this.taskService.findByUserId(userId);
  }

  @Get("user/:userId/incomplete")
  findIncompleteTasksByUserId(@Param("userId") userId: string): Promise<Task[]> {
    return this.taskService.findIncompleteTasksByUserId(userId);
  }

  @Get("user/:userId/upcoming")
  findUpcomingTasksByUserId(@Param("userId") userId: string, @Query("daysAhead") daysAhead: string = "7"): Promise<Task[]> {
    return this.taskService.findUpcomingTasksByUserId(userId, +daysAhead);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<Task | null> {
    return this.taskService.findOne(id);
  }

  @Post()
  create(@Body() task: Partial<Task>): Promise<Task> {
    return this.taskService.create(task);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() task: Partial<Task>): Promise<Task | null> {
    return this.taskService.update(id, task);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.taskService.remove(id);
  }
}

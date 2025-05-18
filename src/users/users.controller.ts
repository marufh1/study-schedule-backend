import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { User } from "./user.schema";
import { UserService } from "./users.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<User | null> {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() user: Partial<User>): Promise<User | null> {
    return this.userService.create(user);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() user: Partial<User>): Promise<User | null> {
    return this.userService.update(id, user);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.userService.remove(id);
  }
}

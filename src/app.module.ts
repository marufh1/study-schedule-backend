import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { EnergyLevelModule } from "./energy-levels/energy-levels.module";
import { OptimizerModule } from "./optimizer/optimizer.module";
import { ScheduleModule } from "./schedules/schedules.module";
import { TaskModule } from "./tasks/tasks.module";
import { UserModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: ".env", // Specify .env file
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ScheduleModule,
    TaskModule,
    EnergyLevelModule,
    OptimizerModule,
  ],
})
export class AppModule {}

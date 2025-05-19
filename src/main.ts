import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import { AppModule } from "./app.module";

// Load environment variables from .env file
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: "http://localhost:3000", // Replace with your frontend's origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Accept, Authorization",
    credentials: true, // Optional: if you need cookies or auth headers
  });

  await app.listen(4000);
  console.log("Study Schedule Optimizer is running on http://localhost:4000");
}
bootstrap();

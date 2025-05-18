import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ type: mongoose.Types.ObjectId, auto: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  estimatedHours: number;

  @Prop({ required: true })
  priority: number; // 1-5, where 5 is highest priority

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  subjectArea: string; // e.g., 'MATH', 'SCIENCE', 'PROGRAMMING', etc.

  @Prop({ default: "MEDIUM" })
  complexityLevel: string; // 'LOW', 'MEDIUM', 'HIGH'

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: mongoose.Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

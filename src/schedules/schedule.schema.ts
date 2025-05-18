import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ScheduleDocument = Schedule & Document;

@Schema()
export class Schedule {
  @Prop({ required: true })
  day: string; // 'MONDAY', 'TUESDAY', etc.

  @Prop({ required: true })
  type: string; // 'WORK', 'CLASS', 'STUDY'

  @Prop({ required: true })
  startTime: string; // HH:MM format

  @Prop({ required: true })
  endTime: string; // HH:MM format

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  location: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: mongoose.Types.ObjectId;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

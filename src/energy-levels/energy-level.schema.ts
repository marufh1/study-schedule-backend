import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type EnergyLevelDocument = EnergyLevel & Document;

@Schema()
export class EnergyLevel {
  @Prop({ type: mongoose.Types.ObjectId, auto: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  day: string; // 'MONDAY', 'TUESDAY', etc.

  @Prop({ required: true })
  timeSlot: string; // 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'

  @Prop({ required: true })
  level: number; // 1-10, where 10 is highest energy

  @Prop({ type: Date })
  date: Date; // Optional specific date

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: mongoose.Types.ObjectId;
}

export const EnergyLevelSchema = SchemaFactory.createForClass(EnergyLevel);

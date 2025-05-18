import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EnergyLevel, EnergyLevelDocument } from "./energy-level.schema";

@Injectable()
export class EnergyLevelService {
  constructor(@InjectModel(EnergyLevel.name) private energyLevelModel: Model<EnergyLevelDocument>) {}

  async findAll(): Promise<EnergyLevel[]> {
    return this.energyLevelModel.find().exec();
  }

  async findByUserId(userId: string): Promise<EnergyLevel[]> {
    return this.energyLevelModel.find({ userId: userId }).exec();
  }

  async findByUserIdAndDay(userId: string, day: string): Promise<EnergyLevel[]> {
    return this.energyLevelModel
      .find({
        userId: userId,
        day,
      })
      .exec();
  }

  async findOne(id: string): Promise<EnergyLevel | null> {
    return this.energyLevelModel.findById(id).exec();
  }

  async create(energyLevel: Partial<EnergyLevel>): Promise<EnergyLevel> {
    const newEnergyLevel = new this.energyLevelModel(energyLevel);
    return newEnergyLevel.save();
  }

  async update(id: string, energyLevel: Partial<EnergyLevel>): Promise<EnergyLevel | null> {
    return this.energyLevelModel.findByIdAndUpdate(id, energyLevel, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.energyLevelModel.findByIdAndDelete(id).exec();
  }
}

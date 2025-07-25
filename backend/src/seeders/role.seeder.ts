import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import RoleModel from "../models/roles-permission.model";
import { RolePermissions } from "../utils/role-permission";

export const seedRoles = async () => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Clear existing roles and permissions
    await RoleModel.deleteMany({}, { session });

    // Seed roles and permissions
    for (const [role, permissions] of Object.entries(RolePermissions)) {
      const existingRole = await RoleModel.findOne({ role }, { session });

      if (!existingRole) {
        await RoleModel.create([{ role, permissions }], { session });
      }
    }

    // Commit the transaction
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

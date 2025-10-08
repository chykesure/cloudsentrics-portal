import mongoose, { Schema, Document } from "mongoose";

export interface IOnboard extends Document {
  primaryName: string;
  primaryEmail: string;
  primaryPhone: string;
  customerId: string;
  avatar?: string;
}

export interface IRequest extends Document {
  email: string;
  tier: string;
  storage: string;
}

const OnboardSchema: Schema = new Schema({
  primaryName: { type: String, required: true },
  primaryEmail: { type: String, required: true, unique: true },
  primaryPhone: { type: String, required: true },
  customerId: { type: String, required: true },
  avatar: { type: String },
});

const RequestSchema: Schema = new Schema({
  email: { type: String, required: true },
  tier: { type: String, required: true },
  storage: { type: String, required: true },
});

export const Onboard = mongoose.model<IOnboard>("Onboard", OnboardSchema);
export const Request = mongoose.model<IRequest>("Request", RequestSchema);

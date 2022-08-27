import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBeach {
  _id?: string;
  name: string;
  position: GeoPosition;
  lat: number;
  lng: number;
  userId: string;
}

export enum GeoPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

const schema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

interface BeachModel extends Omit<IBeach, '_id'>, Document {}

export const Beach: Model<BeachModel> = mongoose.model<BeachModel>(
  'Beach',
  schema
);

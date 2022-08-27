import mongoose, { Document, Model, Schema } from 'mongoose';
import { BaseModel } from '.';

export interface IBeach extends BaseModel {
  name: string;
  position: GeoPosition;
  lat: number;
  lng: number;
  userId: string;
}

export interface ExistingBeach extends IBeach {
  id: string;
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
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

interface BeachModel extends Omit<IBeach, '_id'>, Document {}

export const Beach = mongoose.model<IBeach>('Beach', schema);

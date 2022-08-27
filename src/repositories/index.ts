import { FlattenMaps } from 'mongoose';

export type WithId<T> = { id: string } & T;

export type FilterOptions = Record<string, unknown>;

export interface BaseRepository<T> {
  create(date: T): Promise<FlattenMaps<WithId<T>>>;
  find(options: FilterOptions): Promise<FlattenMaps<WithId<T>>[]>;
}

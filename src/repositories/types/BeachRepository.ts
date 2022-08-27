import { IBeach } from '@src/models/beach';
import { BaseRepository, WithId } from '..';

export interface BeachRepository extends BaseRepository<IBeach> {
  findAllBeachesForUser(userId: string): Promise<WithId<IBeach>[]>;
}

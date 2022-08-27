import { Beach, IBeach } from '@src/models/beach';
import { WithId } from '.';
import { DefaultMongoDBRepository } from './defaultMongoDBRepository';
import { BeachRepository } from './types/BeachRepository';

export class BeachMongoDBRepository
  extends DefaultMongoDBRepository<IBeach>
  implements BeachRepository
{
  constructor(private beachModel = Beach) {
    super(beachModel);
  }

  async findAllBeachesForUser(userId: string): Promise<WithId<IBeach>[]> {
    return await this.beachModel.find({ userId });
  }
}

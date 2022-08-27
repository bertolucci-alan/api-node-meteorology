import logger from '@src/logger';
import { BaseModel } from '@src/models';
import { CUSTOM_VALIDATION } from '@src/models/user';
import { Error, FlattenMaps, Model } from 'mongoose';
import { FilterOptions, WithId } from '.';
import {
  DatabaseInternalError,
  DatabaseUnknownClientError,
  DatabaseValidationError,
  Repository,
} from './repository';

export abstract class DefaultMongoDBRepository<
  T extends BaseModel
> extends Repository<T> {
  constructor(private model: Model<T>) {
    super();
  }

  public async create(data: T): Promise<FlattenMaps<WithId<T>>> {
    try {
      const model = new this.model(data);
      const createdData = await model.save();
      return createdData.toJSON<WithId<T>>();
    } catch (err) {
      this.handleError(err);
    }
  }

  public async find(filter: FilterOptions): Promise<FlattenMaps<WithId<T>>[]> {
    try {
      const data = await this.model.find(filter);
      return data.map((d) => d.toJSON<WithId<T>>());
    } catch (err) {
      throw this.handleError(err);
    }
  }

  //método pode ser sobrescrito mas não acessível de fora da classe
  protected handleError(error: unknown): never {
    if (error instanceof Error.ValidationError) {
      const duplicatedKindErrors = Object.values(error.errors).filter(
        (err) =>
          err.name == 'ValidatorError' &&
          err.kind == CUSTOM_VALIDATION.DUPLICATED
      );
      if (duplicatedKindErrors.length) {
        throw new DatabaseValidationError(error.message);
      }
      throw new DatabaseUnknownClientError(error.message);
    }
    logger.warn(`Database errorc${error}`);
    throw new DatabaseInternalError('Something unexpected to the database');
  }
}

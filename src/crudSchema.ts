import { ForbiddenError } from 'apollo-server-express';
import {
  Resolver, ResolverNextRpCb, ResolverRpCb, schemaComposer,
} from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { DateResolver } from 'graphql-scalars';
import { Document, Model, Query } from 'mongoose';
import { Context } from './context';

import FavoritePlaceModel from './models/FavoritePlace';
import JourneyModel from './models/Journey';

// Use a different Date resolver scalar
schemaComposer.createScalarTC(DateResolver);

type ResolverRbCbWithContext = ResolverRpCb<unknown, Context, unknown>;

// Ensure that when a user creates a model, it is marked as their own
function onCreateRecordOwnModel<TDoc extends Document>(next: ResolverRbCbWithContext): ResolverRbCbWithContext {
  return (resolveParams) => {
    const { userId } = resolveParams.context;

    // eslint-disable-next-line no-param-reassign
    resolveParams.beforeRecordMutate = (record: TDoc): TDoc => {
      record.set('userId', userId);
      return record;
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return next(resolveParams);
  };
}

// Ensure that only the user's own models are allowed to be modified
function onModifyEnforceOwnModel<TDoc extends Document>(next: ResolverRbCbWithContext): ResolverRbCbWithContext {
  return (resolveParams) => {
    const { userId } = resolveParams.context;

    // eslint-disable-next-line no-param-reassign
    resolveParams.beforeRecordMutate = (record: TDoc): TDoc => {
      if (record.get('userId') === userId) {
        return record;
      }

      throw new ForbiddenError('Record does not belong to user');
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return next(resolveParams);
  };
}

// Ensure that only the user's own models are allowed to be read
function onReadEnforceOwnModel(next: ResolverRbCbWithContext): ResolverRbCbWithContext {
  return (resolveParams) => {
    const { userId } = resolveParams.context;

    // eslint-disable-next-line no-param-reassign
    resolveParams.beforeQuery = (query: Query<unknown, never>): void => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      query.where('userId', userId);
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return next(resolveParams);
  };
}

// Wrap each of the resolvers in the dictionary with the provided wrapper
type ResolversDict = {
  [key: string]: Resolver;
}
function wrapAll(resolvers: ResolversDict, wrapper: ResolverNextRpCb<unknown, Context, unknown>) {
  return Object.fromEntries(Object.entries(resolvers).map(([name, resolver]) => [
    name,
    resolver.wrapResolve(wrapper),
  ]));
}

// Augment the GraphQL schema with CRUD operations for the provided model
function registerModel<T extends Document>(model: Model<T>) {
  const objectTypeComposer = composeMongoose(model, {
    removeFields: ['userId'],
  });
  const resolvers = objectTypeComposer.mongooseResolvers;

  const name = model.modelName;
  const prefix = name[0].toLowerCase() + name.slice(1);

  schemaComposer.Query.addFields(wrapAll({
    [`${prefix}ById`]: resolvers.findById(),
    [`${prefix}ByIds`]: resolvers.findByIds(),
    [`${prefix}One`]: resolvers.findOne(),
    [`${prefix}Many`]: resolvers.findMany(),
    [`${prefix}DataLoader`]: resolvers.dataLoader(),
    [`${prefix}DataLoaderMany`]: resolvers.dataLoaderMany(),
    [`${prefix}Count`]: resolvers.count(),
    [`${prefix}Connection`]: resolvers.connection(),
    [`${prefix}Pagination`]: resolvers.pagination(),
  }, onReadEnforceOwnModel));

  schemaComposer.Mutation.addFields({
    [`${prefix}CreateOne`]: resolvers.createOne().wrapResolve(onCreateRecordOwnModel),
    [`${prefix}CreateMany`]: resolvers.createMany().wrapResolve(onCreateRecordOwnModel),
    [`${prefix}UpdateById`]: resolvers.updateById().wrapResolve(onModifyEnforceOwnModel),
    [`${prefix}UpdateOne`]: resolvers.updateOne().wrapResolve(onModifyEnforceOwnModel),
    [`${prefix}UpdateMany`]: resolvers.updateMany().wrapResolve(onReadEnforceOwnModel),
    [`${prefix}RemoveById`]: resolvers.removeById().wrapResolve(onModifyEnforceOwnModel),
    [`${prefix}RemoveOne`]: resolvers.removeOne().wrapResolve(onModifyEnforceOwnModel),
    [`${prefix}RemoveMany`]: resolvers.removeMany().wrapResolve(onReadEnforceOwnModel),
  });
}

// Add all of the models to the schema
registerModel(FavoritePlaceModel);
registerModel(JourneyModel);

const graphqlSchema = schemaComposer.buildSchema();
export default graphqlSchema;

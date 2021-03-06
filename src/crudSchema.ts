import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Document, Model } from 'mongoose';

import FavoritePlaceModel from './models/FavoritePlace';
import JourneyModel from './models/Journey';

// Augment the GraphQL schema with CRUD operations for the provided model
function registerModel<T extends Document>(model: Model<T>) {
  const objectTypeComposer = composeMongoose(model);
  const resolvers = objectTypeComposer.mongooseResolvers;

  const name = model.modelName;
  const prefix = name[0].toLowerCase() + name.slice(1);

  schemaComposer.Query.addFields({
    [`${prefix}ById`]: resolvers.findById(),
    [`${prefix}ByIds`]: resolvers.findByIds(),
    [`${prefix}One`]: resolvers.findOne(),
    [`${prefix}Many`]: resolvers.findMany(),
    [`${prefix}DataLoader`]: resolvers.dataLoader(),
    [`${prefix}DataLoaderMany`]: resolvers.dataLoaderMany(),
    [`${prefix}Count`]: resolvers.count(),
    [`${prefix}Connection`]: resolvers.connection(),
    [`${prefix}Pagination`]: resolvers.pagination(),
  });

  schemaComposer.Mutation.addFields({
    [`${prefix}CreateOne`]: resolvers.createOne(),
    [`${prefix}CreateMany`]: resolvers.createMany(),
    [`${prefix}UpdateById`]: resolvers.updateById(),
    [`${prefix}UpdateOne`]: resolvers.updateOne(),
    [`${prefix}UpdateMany`]: resolvers.updateMany(),
    [`${prefix}RemoveById`]: resolvers.removeById(),
    [`${prefix}RemoveOne`]: resolvers.removeOne(),
    [`${prefix}RemoveMany`]: resolvers.removeMany(),
  });
}

// Add all of the models to the schema
registerModel(FavoritePlaceModel);
registerModel(JourneyModel);

const graphqlSchema = schemaComposer.buildSchema();
export default graphqlSchema;

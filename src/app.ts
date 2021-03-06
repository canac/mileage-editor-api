import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import crudSchema from './crudSchema';
import { connect } from './db';

const server = new ApolloServer({
  schema: crudSchema,
  cors: {
    origin: [process.env.FRONTEND_ORIGIN ?? '', 'https://studio.apollographql.com'],
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
  },
});
const port = process.env.PORT;
connect().then(() => server.listen({ port: port ? parseInt(port, 10) : 3001 })).then(({ url }) => {
  // eslint-disable-next-line no-console
  console.log(`Server running at ${url}`);
}).catch((err: Error) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

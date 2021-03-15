import 'dotenv/config';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import jwt from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import { Context } from './context';
import crudSchema from './crudSchema';
import { connect } from './db';

const app = express();
app.use(cors({
  origin: [process.env.FRONTEND_ORIGIN ?? '', 'https://studio.apollographql.com'],
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
}));
app.use(jwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://mileage-editor.us.auth0.com/.well-known/jwks.json',
  }),
  audience: 'https://mileage-editor-api.herokuapp.com',
  issuer: 'https://mileage-editor.us.auth0.com/',
  algorithms: ['RS256'],
}));

const server = new ApolloServer({
  schema: crudSchema,
  context({ req }): Context {
    const userId = (req.user?.sub ?? null);
    if (!userId) {
      throw new AuthenticationError('Unknown user');
    }

    return {
      userId,
    };
  },
});
server.applyMiddleware({ app, path: '/' });

const { PORT } = process.env;
const port = PORT ? parseInt(PORT, 10) : 3001;
connect().then(() => app.listen({ port })).then(() => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
}).catch((err: Error) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

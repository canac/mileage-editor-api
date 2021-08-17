import { IdentityContext, NetlifyJwtVerifier } from '@serverless-jwt/netlify';
import { ApolloServer, AuthenticationError } from 'apollo-server-lambda';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ApolloContext } from '../context';
import crudSchema from '../crudSchema';
import { connect } from '../db';

const jwt = NetlifyJwtVerifier({
  audience: 'https://mileage-editor-api.calebapps.com',
  issuer: 'https://mileage-editor.us.auth0.com/',
});

// NetlifyJwtVerifier adds the identityContext field
interface AuthenticatedContext extends Context {
  identityContext: IdentityContext;
}

const server = new ApolloServer({
  schema: crudSchema,
  context({ context }: { context: AuthenticatedContext }): ApolloContext {
    // Extract the user ID from the claims
    const userId: string | null =
      (context.identityContext.claims.sub as string) ?? null;
    if (!userId) {
      throw new AuthenticationError('Unknown user');
    }

    return {
      userId,
    };
  },
});

// Create the Apollo GraphQL serverless handler
const graphqlHandler = server.createHandler({
  cors: {
    origin: [
      process.env.FRONTEND_ORIGIN ?? '',
      'https://studio.apollographql.com',
    ],
    allowedHeaders: 'Origin, Content-Type, Accept, Authorization',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
  },
});

async function requestHandler(
  event: APIGatewayEvent,
  context: Context,
): Promise<void | APIGatewayProxyResult> {
  // Connect to the database
  await connect();

  // Pass the request to the GraphQL server
  return graphqlHandler(event, context, undefined);
}

// Verify the JWT before processing the request
const authHandler = jwt(requestHandler);

// eslint-disable-next-line import/prefer-default-export
export function handler(
  event: APIGatewayEvent,
  context: Context,
): Promise<void | APIGatewayProxyResult> {
  // Don't authenticate OPTIONS requests
  if (event.httpMethod !== 'OPTIONS') {
    return authHandler(
      event,
      context,
      undefined,
    ) as Promise<void | APIGatewayProxyResult>;
  }
  return requestHandler(event, context);
}

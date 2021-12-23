import AsyncStorage from '@react-native-async-storage/async-storage'
import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';


const httpLink = createHttpLink({
  uri: 'http://api.wasitt.com/graphql',
  // uri: 'http://192.168.0.101:3000/graphql',
  headers: {
    'Access-Control-Allow-Origin': '*',
    Connection: 'keep-alive',
  },
});

const wsLink = new WebSocketLink({
  uri: 'ws://api.wasitt.com/subscriptions',
  // uri: 'ws://192.168.0.101:3000/subscriptions',
  options: {
    reconnect: true,
    connectionCallback: (err) => {
      console.log(err, 'mateus');
    },
    connectionParams: async () => {
      const token = await AsyncStorage.getItem('token');

      return {
        authorization: token ? `Bearer ${token}` : "",
      }
    },
  },
});

const authHttpLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});


const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authHttpLink.concat(httpLink),
);


const apollo = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            // // Don't cache separate results based on
            // // any of this field's arguments.
            // keyArgs: false,
            // // Concatenate the incoming list items with
            // // the existing list items.
            // merge(existing = [], incoming) {
            //   console.log('in pagination', { existing, incoming });
              
            //   return [...existing, ...incoming];
            // },

            // read(existing, { args: { options: { skip = 0, limit = existing?.length }, ...args } = { options: {} } }) {
            //   // A read function should always return undefined if existing is
            //   // undefined. Returning undefined signals that the field is
            //   // missing from the cache, which instructs Apollo Client to
            //   // fetch its value from your GraphQL server.
            //   console.log({ ...args, options: { skip, limit } });
              
            //   return existing && existing.slice(skip, skip + limit);
            // },

            keyArgs: [],
            merge(existing, incoming, { args: { options: { skip = 0 } } = { options: { skip: 0 } } }) {
              // Slicing is necessary because the existing data is
              // immutable, and frozen in development.
              
              const merged = existing ? existing.slice(0) : [];
              for (let i = 0; i < incoming.length; ++i) {
                merged[skip + i] = incoming[i];
              }
              return merged;
            },
          }
        }
      }
    }
  }),
});

export default apollo
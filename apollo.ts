import { ApolloLink, Operation } from 'apollo-link';
import { RetryLink } from 'apollo-link-retry';
import { apiUrl } from 'consts';
import { makePost } from 'utils';

export enum ApolloFetchPolicy {
  cacheFirst = 'cache-first',
  cacheOnly = 'cache-only',
  cacheAndNetwork = 'cache-and-network',
  networkOnly = 'network-only',
  noCache = 'no-cache',
  standby = 'standby',
}

const uri = `${apiUrl}/graphql`;

let permissionSummaryRequestInProgress: Promise<any> | undefined;
// Attempt an operation multiple times if it fails due to network or server errors.
// Initial retry at 300ms, then 600, 1200, 2400, 4800, limited to 5 attempts
// Because of "jitter" option these retry times are randomized anywhere between 0ms (instant), and 2x the configured delay
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => !!error,
  },
});

// @ts-ignore
const uploadLink = createUploadLink({
  uri,
  credentials: 'include',
});
export const permissionLinkHandler = (operation: Operation) => {
  const clientPermissionTimestamp =
    Number(localStorage.getItem('permissions-updated-at')) || -Infinity;
  const context = operation.getContext();
  const headers = context.response.headers;
  const authorization = context.headers.authorization;
  if (headers) {
    const permissionsUpdatedAt = headers.get('x-permissions-updated-at');
    const permissionsTimestamp = Date.parse(permissionsUpdatedAt) || 0;
    if (permissionsTimestamp) {
      if (
        permissionsTimestamp > clientPermissionTimestamp &&
        !permissionSummaryRequestInProgress
      ) {
        return makePost('/permissions', {}, { authorization }, 'GET')
          .then(response => {
            localStorage.setItem('permissions', JSON.stringify(response.data));
            localStorage.setItem(
              'permissions-updated-at',
              String(permissionsTimestamp),
            );
          })
          .catch(error => {
            console.error('Unable to retrieve and store permissions', error);
          });
      }
    }
  }
};

const permissionLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(data => {
    console.log(permissionSummaryRequestInProgress);
    if (!permissionSummaryRequestInProgress) {
      permissionSummaryRequestInProgress = permissionLinkHandler(
        operation,
      )?.finally(() => {
        permissionSummaryRequestInProgress = undefined;
      });
    }
    return data;
  });
});
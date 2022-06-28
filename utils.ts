import { apiUrl } from 'consts';

class PostError extends Error {
  response?: Record<string, any>;

  constructor(test: string, response: Response) {
    super(test);
    this.name = 'PostError';
    this.response = response;
  }
}

export const makePost = async (
  endpoint: RequestInfo,
  data?: object,
  headers?: object,
  method?: 'POST' | 'GET',
) => {
  const options: RequestInit =
    method === 'GET'
      ? {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...headers },
        }
      : {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: data ? JSON.stringify(data) : undefined,
        };
  const response = await fetch(`${apiUrl}${endpoint}`, options);

  const error = new PostError(response.statusText, response);
  if (!response.ok) throw error;

  try {
    return await response.json();
  } catch (error) {
    return {};
  }
};
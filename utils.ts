import { apiUrl } from './consts';

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
) => {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: data ? JSON.stringify(data) : undefined,
  });

  const error = new PostError(response.statusText, response);
  if (!response.ok) throw error;
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
};
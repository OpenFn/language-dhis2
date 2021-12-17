import axios from 'axios';

export function request({ username, password }, axiosRequest) {
  const { method, url } = axiosRequest;

  console.log(`Sending ${method} request to ${url}`);

  return axios.request({
    headers: { 'Content-Type': 'application/json' },
    auth: { username, password },
    // Note that providing headers or auth in the request object will overwrite.
    ...axiosRequest,
  });
}

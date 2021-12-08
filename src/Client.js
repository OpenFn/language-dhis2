import axios from 'axios';

export function request({ method, url, data, options }) {
  let headers = { 'Content-Type': 'application/json' };
  let req = { method, url, headers, ...options };
  if (method !== 'get') {
    req = { ...req, data };
  }
  return axios.request(req);
}

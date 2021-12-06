import axios from 'axios';

export function post(url, data, configs) {
  return axios.request({
    method: 'POST',
    url,
    data,
    headers: { 'Content-Type': 'application/json' },
    ...configs,
  });
}

export function put(url, data, configs) {
  return axios.request({
    method: 'PUT',
    url,
    data,
    headers: { 'Content-Type': 'application/json' },
    ...configs,
  });
}

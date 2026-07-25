export { isTokenValid } from './jwt';

const TOKEN_KEY = 'bastas-customer-token';

export function getCustomerToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearCustomerToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function createOrder(apiUrl, payload, customerToken) {
  const res = await fetch(`${apiUrl}/api/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || 'Не удалось оформить заказ. Попробуйте ещё раз.');
  }
  return data;
}

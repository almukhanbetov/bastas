// Декодируем payload JWT на клиенте только чтобы проверить срок действия —
// это не проверка подписи (её делает backend на каждый запрос), а лишь UX-подсказка,
// чтобы не показывать разделы "залогинен", когда токен уже просрочен.
export function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

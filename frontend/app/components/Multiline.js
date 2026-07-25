// Рендерит текст с переносами строк (\n) как <br/> — тексты из админки
// хранят перенос как обычный символ новой строки, без HTML.
export default function Multiline({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

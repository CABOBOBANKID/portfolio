export default function Paragraphs({ text }: { text?: string | null }) {
  const blocks = (text ?? '').trim().split(/\r?\n\s*\r?\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => (
        <p key={i}>
          {block.split(/\r?\n/).map((line, j, all) => (
            <span key={j}>{line}{j < all.length - 1 && <br />}</span>
          ))}
        </p>
      ))}
    </>
  );
}

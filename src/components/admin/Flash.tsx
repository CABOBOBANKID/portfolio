export type FlashParams = { msg?: string; t?: string };

export default function Flash({ sp }: { sp: FlashParams }) {
  if (typeof sp.msg !== 'string' || sp.msg === '') return null;
  return <div className={`notice ${sp.t === 'error' ? 'error' : 'success'}`} role="status">{sp.msg.slice(0, 240)}</div>;
}

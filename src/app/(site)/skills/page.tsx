import type { Metadata } from 'next';
import { getSkillGroups } from '@/lib/data';

export const metadata: Metadata = { title: 'Skills | John Nsoh', description: 'Technical skills across frontend, backend, databases and tools.' };

export default async function SkillsPage() {
  const skills = await getSkillGroups();
  return (
    <section>
      <div className="container">
        <div className="section-head"><p className="eyebrow">Technology</p><h1>Skills and tools</h1></div>
        <div className="skill-groups">
          {Object.entries(skills).map(([category, names]) => (
            <div className="card" key={category}>
              <h3>{category}</h3>
              <div className="skill-list">{names.map((n) => <span className="badge" key={n}>{n}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

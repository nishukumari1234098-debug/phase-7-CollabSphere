import { Sparkles } from "lucide-react";

export default function PageGuide({
  title,
  description,
  note,
  variant = "default",
  icon: Icon = Sparkles,
}) {
  return (
    <aside className={`page-guide page-guide-${variant}`}>
      <span className="page-guide-icon"><Icon size={19} /></span>
      <div className="page-guide-copy">
        <span className="page-guide-label">A LITTLE WORKSPACE INSPIRATION</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="page-guide-note">
        <Sparkles size={15} />
        <span>{note}</span>
      </div>
    </aside>
  );
}

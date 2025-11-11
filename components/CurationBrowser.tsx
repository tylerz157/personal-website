"use client";
import { useMemo, useState } from "react";
import type { CurationMeta } from "../lib/curations";
import CurationCard from "./CurationCard";

export default function CurationBrowser({ items }: { items: CurationMeta[] }) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showMore, setShowMore] = useState(false);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const i of items) {
      if (i.tags) for (const t of i.tags) s.add(t);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hasQuery = q.length > 0;
    const needTags = selectedTags.size > 0;
    return items.filter((i) => {
      if (hasQuery) {
        const hay = `${i.title} ${i.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (needTags) {
        const tags = new Set(i.tags ?? []);
        let ok = false;
        for (const t of selectedTags) { if (tags.has(t)) { ok = true; break; } }
        if (!ok) return false;
      }
      return true;
    });
  }, [items, query, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }

  function clearTopics() {
    setSelectedTags(new Set());
  }

  return (
    <div className="projects-browser">
      <div className="controls-wrap">
        <div className="controls half">
          <input
            type="text"
            className="control-input"
            placeholder="Search items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search curations"
          />
        </div>
        {allTags.length ? (
          <div className="topics half" role="group" aria-label="Topics">
            <div className="topics-row">
              {/* Only the More topics button (no general featured chips) */}
              <button
                type="button"
                className="tag-chip more-btn"
                onClick={() => setShowMore((v) => !v)}
                aria-expanded={showMore}
                aria-controls="curation-topics-tray"
              >
                More topics
              </button>
              <div id="curation-topics-tray" className={`topics-tray ${showMore ? "open" : ""}`}>
                {allTags.map((tag) => {
                  const active = selectedTags.has(tag);
                  return (
                    <label key={tag} className="topic-item">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleTag(tag)}
                      />
                      <span>{tag}</span>
                    </label>
                  );
                })}
              </div>
              <button type="button" className="tag-chip clear" onClick={clearTopics}>Clear topics</button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {filtered.map((item, i) => (
          <CurationCard key={item.slug} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

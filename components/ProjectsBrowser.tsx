"use client";
import { useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";
import type { ProjectMeta } from "../lib/projects";

type Props = {
	projects: ProjectMeta[];
};

function normalize(str: string): string {
	return str.toLowerCase();
}

export default function ProjectsBrowser({ projects }: Props) {
	const [query, setQuery] = useState("");
	const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
	const [showMore, setShowMore] = useState(false);

	const allTags = useMemo(() => {
		const s = new Set<string>();
		for (const p of projects) {
			if (p.tags) for (const t of p.tags) s.add(t);
		}
		return Array.from(s).sort((a, b) => a.localeCompare(b));
	}, [projects]);

	const featuredTopics = useMemo(() => allTags.slice(0, 2), [allTags]);
	const moreTopics = useMemo(() => allTags.slice(2), [allTags]);

	const filtered = useMemo(() => {
		const q = normalize(query.trim());
		const hasQuery = q.length > 0;
		const needTags = selectedTags.size > 0;

		return projects.filter((p) => {
			if (hasQuery) {
				const hay = `${p.title} ${p.description}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			if (needTags) {
				const tags = new Set(p.tags ?? []);
				let match = false;
				for (const t of selectedTags) {
					if (tags.has(t)) { match = true; break; }
				}
				if (!match) return false;
			}
			return true;
		});
	}, [projects, query, selectedTags]);

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
						placeholder="Search title or description..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						aria-label="Search projects"
					/>
				</div>
				{allTags.length ? (
					<div className="topics half" role="group" aria-label="Topics">
						<div className="topics-row">
							{featuredTopics.map((tag) => {
								const active = selectedTags.has(tag);
								return (
									<button
										key={tag}
										type="button"
										className={`tag-chip ${active ? "active" : ""}`}
										onClick={() => toggleTag(tag)}
										aria-pressed={active}
									>
										{tag}
									</button>
								);
							})}
							<button
								type="button"
								className="tag-chip more-btn"
								onClick={() => setShowMore((v) => !v)}
								aria-expanded={showMore}
								aria-controls="topics-tray"
							>
								More topics
							</button>
							<div id="topics-tray" className={`topics-tray ${showMore ? "open" : ""}`}>
								{moreTopics.map((tag) => {
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
			<div className="grid timeline">
				{filtered.map((p, i) => (
					<ProjectCard key={p.slug} project={p} mirrored={false} index={i} />
				))}
				<div className="timeline-bottom" aria-hidden="true"></div>
			</div>
		</div>
	);
}



"use client";
import { useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";
import type { ProjectMeta } from "../lib/projects";

type Props = {
	projects: ProjectMeta[];
	featuredTopics?: string[];
};

function normalize(str: string): string {
	return str.toLowerCase();
}

// Define tag groups
const tagGroups = {
  size: new Set(['big', 'small']),
  type: new Set(['professional', 'for-fun']),
  team: new Set(['solo', 'team'])
} as const;

// Function to check if a tag belongs to any group
function getTagGroup(tag: string): keyof typeof tagGroups | null {
  for (const [group, tags] of Object.entries(tagGroups)) {
    if (tags.has(tag)) {
      return group as keyof typeof tagGroups;
    }
  }
  return null;
}

export default function ProjectsBrowser({ projects, featuredTopics: featuredTopicsProp }: Props) {
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

	const featuredTopics = useMemo(() => {
		if (featuredTopicsProp && featuredTopicsProp.length) return featuredTopicsProp;
		return allTags.slice(0, 2);
	}, [allTags, featuredTopicsProp]);
	const moreTopics = useMemo(() => {
		const featuredSet = new Set(featuredTopics);
		return allTags.filter((t) => !featuredSet.has(t));
	}, [allTags, featuredTopics]);

	const filtered = useMemo(() => {
		const q = normalize(query.trim());
		const hasQuery = q.length > 0;
		
		// Get the selected tags grouped by their category
		const selectedByGroup = {
			size: Array.from(selectedTags).filter(tag => tagGroups.size.has(tag)),
			type: Array.from(selectedTags).filter(tag => tagGroups.type.has(tag)),
			team: Array.from(selectedTags).filter(tag => tagGroups.team.has(tag)),
			other: Array.from(selectedTags).filter(tag => 
				!tagGroups.size.has(tag) && 
				!tagGroups.type.has(tag) && 
				!tagGroups.team.has(tag)
			)
		};

		return projects.filter((p) => {
			// Text search
			if (hasQuery) {
				const hay = `${p.title} ${p.description}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}

			const projectTags = new Set(p.tags ?? []);
			
			// Check required tag groups (AND between groups)
			if (selectedByGroup.size.length > 0 && !selectedByGroup.size.some(tag => projectTags.has(tag))) {
				return false;
			}
			if (selectedByGroup.type.length > 0 && !selectedByGroup.type.some(tag => projectTags.has(tag))) {
				return false;
			}
			if (selectedByGroup.team.length > 0 && !selectedByGroup.team.some(tag => projectTags.has(tag))) {
				return false;
			}
			
			// Check other tags (OR within the group)
			if (selectedByGroup.other.length > 0 && !selectedByGroup.other.some(tag => projectTags.has(tag))) {
				return false;
			}
			
			return true;
		});
	}, [projects, query, selectedTags]);

	function toggleTag(tag: string) {
		setSelectedTags((prev) => {
			const next = new Set(prev);
			const group = getTagGroup(tag);
			
			// If the tag is in a group, handle mutual exclusivity
			if (group) {
				// First, remove all tags from the same group
				for (const t of next) {
					if (tagGroups[group].has(t)) {
						next.delete(t);
					}
				}
				// Then add the new tag if it wasn't already selected
				if (!prev.has(tag)) {
					next.add(tag);
				}
			} else {
				// Toggle the tag if it's not in any group
				if (next.has(tag)) {
					next.delete(tag);
				} else {
					next.add(tag);
				}
			}
			
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
								MORE-TOPICS 
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



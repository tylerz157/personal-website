import Image from 'next/image';
import Link from 'next/link';
import { ProjectMeta } from '../lib/projects';

export default function ProjectCard({ project, mirrored, index }: { project: ProjectMeta; mirrored: boolean; index: number }) {
	const cover = project.coverImage ?? 'https://via.placeholder.com/900x600?text=Cover';
	const alt = project.coverAlt ?? `${project.title} cover`;

	function computeEnd(meta: ProjectMeta): { endText: string; duration?: string } | null {
		if (!meta.date) return null;
		const start = new Date(meta.date);
		const end = meta.endDate ? new Date(meta.endDate) : new Date();
		const endText = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' }).format(end);
		let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
		if (end.getDate() < start.getDate()) months -= 1;
		const durationMonths = Math.max(1, months);
		const duration = durationMonths === 1 ? '1 month' : `${durationMonths} months`;
		return { endText, duration };
	}

	const endInfo = computeEnd(project);
	return (
		<Link href={`/projects/${project.slug}`} className="project-link" aria-label={project.title}>
			<article className="project-row">
				<div className="project-inner">
					<div className="project-cover">
						<Image
							src={cover}
							alt={alt}
							fill
							sizes="(max-width: 800px) 100vw, 480px"
							style={{ objectFit: 'cover' }}
							priority={index < 2}
						/>
					</div>
					<div className="project-content">
						<div className="project-title-row">
							<h2 style={{ margin: 0 }}>{project.title}</h2>
						</div>
						<p>{project.description}</p>
						<div className="project-meta">
							{project.tags && project.tags.length ? project.tags.join(', ') : null}
						</div>
					</div>
				</div>
				<div className="project-timeline">
					{endInfo ? (
						<div className="timeline-date-block">
							<span className="timeline-date">{endInfo.endText}</span>
							{endInfo.duration ? <span className="timeline-duration">{endInfo.duration}</span> : null}
						</div>
					) : null}
				</div>
			</article>
		</Link>
	);
}



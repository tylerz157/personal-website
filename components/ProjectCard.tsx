import Image from 'next/image';
import Link from 'next/link';
import { ProjectMeta } from '../lib/projects';

export default function ProjectCard({ project, mirrored, index }: { project: ProjectMeta; mirrored: boolean; index: number }) {
	// Add base path for local images
const getImagePath = (path: string) => {
  if (!path) return 'https://via.placeholder.com/900x600?text=Cover';
  // If it's an external URL, return as is
  if (path.startsWith('http')) return path;
  // For local images, add the base path
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}${path}`;
};

const cover = getImagePath(project.coverImage);
	const alt = project.coverAlt ?? `${project.title} cover`;

	function computeEnd(meta: ProjectMeta): { endText: string; duration: string; isOngoing: boolean } | null {
		if (!meta.date) return null;
		
		const start = new Date(meta.date);
		const isOngoing = meta.endDate?.toLowerCase() === 'present';
		const end = isOngoing ? new Date() : (meta.endDate ? new Date(meta.endDate) : new Date());
		const endText = isOngoing ? 'Present' : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' }).format(end);
		
		// Calculate the difference in milliseconds
		const diffTime = Math.abs(end.getTime() - start.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		let duration: string;
		
		// Determine the most appropriate time unit
		if (diffDays < 7) {
			duration = diffDays === 1 ? '1 day' : `${diffDays} days`;
		} else if (diffDays < 30) {
			const weeks = Math.round(diffDays / 7);
			duration = weeks === 1 ? '1 week' : `${weeks} weeks`;
		} else if (diffDays < 365) {
			const months = Math.round(diffDays / 30);
			duration = months === 1 ? '1 month' : `${months} months`;
		} else {
			// For years, be more precise with months
			const years = Math.floor(diffDays / 365);
			const remainingMonths = Math.round((diffDays % 365) / 30);
			
			if (remainingMonths === 0) {
				duration = years === 1 ? '1 year' : `${years} years`;
			} else {
				const yearsText = years === 1 ? '1 year' : `${years} years`;
				const monthsText = remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;
				duration = `${yearsText}, ${monthsText}`;
			}
		}

		// Add '+' to duration for ongoing projects
		if (isOngoing) {
			duration += '+';
		}
		
		return { endText, duration, isOngoing };
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



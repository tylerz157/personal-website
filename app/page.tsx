import { getAllProjects } from '../lib/projects';
import ProjectsBrowser from '../components/ProjectsBrowser';

export const dynamic = 'force-static';

export default async function ProjectsPage() {
	const projects = await getAllProjects();
	return (
		<>
			<section style={{ margin: '28px 0 22px' }}>
				<h1>Projects</h1>
				<p style={{ color: 'var(--muted)', margin: '6px 0 0 0' }}>
					Selected work. Click any project to read more details and see photos.
				</p>
			</section>
			<ProjectsBrowser projects={projects} />
		</>
	);
}



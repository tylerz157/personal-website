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
					Collection of all the projects I've made over the years, using skills across all engineering fields to realize interesting ideas!
				</p>
				<p style={{ color: 'var(--muted)', margin: '6px 0 0 0' }}>
					From cars, robotics, sustainability, AI, video games, and more.
				</p>
			</section>
			<ProjectsBrowser projects={projects}
				featuredTopics={['professional', 'for-fun','solo','team','big','small']}
			 />
		</>
	);
}



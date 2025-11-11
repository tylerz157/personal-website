import './global.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Portfolio',
	description: 'Projects and work',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<header className="site-header">
					<div className="container">
						<Link className="brand" href="/">My Portfolio</Link>
						<nav className="nav">
							<Link href="/">Projects</Link>
							<Link href="/curations">Curations</Link>
						</nav>
					</div>
				</header>
				<main className="container">{children}</main>
				<footer className="site-footer">
					<div className="container">© {new Date().getFullYear()} • Built with Next.js</div>
				</footer>
			</body>
		</html>
	);
}



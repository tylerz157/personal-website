import './global.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import FooterLogin from '../components/FooterLogin';

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
						<Link className="brand" href="/">Made by Horizon</Link>
						<nav className="nav">
							<Link href="/">Projects</Link>
							{/* <Link href="/curations">Curations</Link> */}
						</nav>
					</div>
				</header>
				<main className="container">{children}</main>
				<footer className="site-footer">
					<div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<span>© {new Date().getFullYear()} • Tyler Zhang</span>
						<FooterLogin />
					</div>
				</footer>
			</body>
		</html>
	);
}



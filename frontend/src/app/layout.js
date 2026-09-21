import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'News Pulse — Topic-Clustered News Timeline',
  description: 'Full-stack news intelligence app that pulls RSS articles, groups them into topic clusters, and visualizes them on a custom SVG timeline.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

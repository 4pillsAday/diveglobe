import './globals.css';

// Use default Node.js runtime locally for OpenNext compatibility

export const metadata = {
  title: 'DiveGlobe',
  description: 'Interactive globe of dive sites around the world',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0b1220', color: 'white' }}>{children}</body>
    </html>
  );
}

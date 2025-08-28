import GlobeClient from '../components/GlobeClient';

// Use default Node.js runtime locally for OpenNext compatibility

export default function HomePage() {
  return (
    <main style={{ height: '100vh', width: '100vw' }}>
      <GlobeClient />
    </main>
  );
}

import GlobeClient from '../components/GlobeClient';

export const runtime = 'edge';

export default function HomePage() {
  return (
    <main style={{ height: '100vh', width: '100vw' }}>
      <GlobeClient />
    </main>
  );
}

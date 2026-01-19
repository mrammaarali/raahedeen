import dynamic from 'next/dynamic';

const SettingsManager = dynamic(() => import('./SettingsManager'), {
  ssr: false,
  loading: () => <p>Loading Settings...</p>,
});

export default function SettingsPage() {
  return <SettingsManager />;
}

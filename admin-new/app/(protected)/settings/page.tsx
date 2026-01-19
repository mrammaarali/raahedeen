import dynamic from 'next/dynamic';

const SettingsManager = dynamic(() => import('./SettingsManager'), { ssr: false });

export default function SettingsPage() {
  return <SettingsManager />;
}

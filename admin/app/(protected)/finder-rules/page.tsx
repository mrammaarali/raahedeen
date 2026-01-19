import dynamic from 'next/dynamic';

const FinderRuleManager = dynamic(() => import('./FinderRuleManager'), {
  ssr: false,
  loading: () => <p>Loading Finder Rules...</p>,
});

export default function FinderRulesPage() {
  return <FinderRuleManager />;
}

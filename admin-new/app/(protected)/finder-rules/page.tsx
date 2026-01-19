import dynamic from 'next/dynamic';

const FinderRuleManager = dynamic(() => import('./FinderRuleManager'), { ssr: false });

export default function FinderRulesPage() {
  return <FinderRuleManager />;
}

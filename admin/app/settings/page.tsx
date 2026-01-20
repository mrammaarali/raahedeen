"use client";

import withAdminAuth from '../components/withAdminAuth';

import SettingsForm from './SettingsForm';

const SettingsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Global App Settings</h1>
      <SettingsForm />
    </div>
  );
};

export default withAdminAuth(SettingsPage);

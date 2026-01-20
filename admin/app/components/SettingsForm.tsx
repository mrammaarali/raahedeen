"use client";

import { useState, useEffect } from 'react';
import useSettings, { AppSettings } from '../hooks/useSettings';

const SettingsForm = () => {
  const { settings, loading, error, updateSettings } = useSettings();
  const [formData, setFormData] = useState<Partial<AppSettings>>({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLanguageChange = (lang: keyof AppSettings['enabledLanguages']) => {
    setFormData(prev => {
      const currentLanguages = prev.enabledLanguages || { EN: false, HI: false, UR: false, AR: false };
      return {
        ...prev,
        enabledLanguages: {
          ...currentLanguages,
          [lang]: !currentLanguages[lang],
        },
      };
    });
  };

  const handleBannerChange = (index: number, value: string) => {
    const newBanners = [...(formData.homeScreenBanners || [])];
    newBanners[index] = value;
    setFormData(prev => ({ ...prev, homeScreenBanners: newBanners }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    alert('Settings updated successfully!');
  };

  if (loading) return <div>Loading settings...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Contact & URLs</h3>
        <input name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} placeholder="WhatsApp Number" className="w-full p-2 rounded bg-gray-700 mb-2" />
        <input name="radioStreamUrl" value={formData.radioStreamUrl || ''} onChange={handleChange} placeholder="Radio Stream URL" className="w-full p-2 rounded bg-gray-700" />
      </div>
      
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Donation Details</h3>
        <input name="donationUpi" value={formData.donationUpi || ''} onChange={handleChange} placeholder="Donation UPI" className="w-full p-2 rounded bg-gray-700 mb-2" />
        <textarea name="donationBankDetails" value={formData.donationBankDetails || ''} onChange={handleChange} placeholder="Bank Details" className="w-full p-2 rounded bg-gray-700 mb-2"></textarea>
        <input name="donationQrImage" value={formData.donationQrImage || ''} onChange={handleChange} placeholder="QR Image URL" className="w-full p-2 rounded bg-gray-700" />
      </div>

      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Home Screen Banners (up to 5)</h3>
        {[...Array(5)].map((_, index) => (
          <input key={index} value={formData.homeScreenBanners?.[index] || ''} onChange={(e) => handleBannerChange(index, e.target.value)} placeholder={`Banner Image URL ${index + 1}`} className="w-full p-2 rounded bg-gray-700 mb-2" />
        ))}
      </div>

      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Enabled Languages</h3>
        <div className="flex space-x-4">
          {Object.keys(formData.enabledLanguages || {}).map(lang => (
            <label key={lang} className="flex items-center space-x-2">
              <input type="checkbox" checked={formData.enabledLanguages?.[lang as keyof AppSettings['enabledLanguages']]} onChange={() => handleLanguageChange(lang as keyof AppSettings['enabledLanguages'])} />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Monetization</h3>
        <label className="flex items-center space-x-2">
          <input name="adsEnabled" type="checkbox" checked={formData.adsEnabled || false} onChange={handleChange} />
          <span>Ads Enabled</span>
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="px-6 py-2 rounded bg-gold-500 text-black font-semibold">Save All Settings</button>
      </div>
    </form>
  );
};

export default SettingsForm;

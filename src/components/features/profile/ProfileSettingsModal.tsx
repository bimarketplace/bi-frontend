"use client";

import React, { useState, useEffect } from "react";
import { Cancel01Icon, Settings01Icon, WhatsappIcon, CheckmarkCircle01Icon } from "hugeicons-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { updateProfile } from "@/lib/auth";
import { fetchStates, fetchLGAs, State, LGA } from "@/lib/locations";

interface ProfileSettingsModalProps {
  initialData: { whatsapp_number: string; bio: string; first_name?: string; last_name?: string };
  onClose: () => void;
  onSuccess?: () => void;
}

const ProfileSettingsModal = ({ initialData, onClose, onSuccess }: ProfileSettingsModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const { data: session } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: initialData.first_name || '',
    last_name: initialData.last_name || '',
    whatsapp_number: initialData.whatsapp_number || '',
    bio: initialData.bio || '',
    state: (initialData as any).state || '',
    lga: (initialData as any).lga || ''
  });

  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<LGA[]>([]);

  useEffect(() => {
    const loadLocations = async () => {
      const statesData = await fetchStates();
      setStates(statesData);
      if (formData.state) {
        const lgasData = await fetchLGAs(Number(formData.state));
        setLgas(lgasData);
      }
    };
    loadLocations();
  }, []);

  const handleStateChange = async (stateId: string) => {
    setFormData({ ...formData, state: stateId, lga: '' });
    if (stateId) {
      const lgasData = await fetchLGAs(Number(stateId));
      setLgas(lgasData);
    } else {
      setLgas([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsOpening(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setIsOpening(false);
    setTimeout(onClose, 300);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    setIsUpdating(true);
    try {
      await updateProfile(formData, (session as any).access_token);
      toast.success("Profile updated successfully");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-stretch sm:justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-[#008000]/5 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div 
        className={`relative w-full sm:w-[500px] bg-white h-[90vh] sm:h-full shadow-2xl transition-transform duration-300 ease-out flex flex-col
          ${(!isOpening || isClosing) ? 'translate-y-full sm:translate-x-full' : 'translate-y-0 sm:translate-x-0'}`}
      >
        {/* Mobile Handle */}
        <div className="sm:hidden w-full flex justify-center py-3 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between shrink-0 border-b border-gray-50">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings01Icon size={24} />
            Profile Settings
          </h3>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 bg-gray-50 rounded-full text-gray-900 transition-colors"
          >
            <Cancel01Icon size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 sm:py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:bg-white focus:border-primary-600 transition-all font-medium text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 sm:py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:bg-white focus:border-primary-600 transition-all font-medium text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">WhatsApp Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <WhatsappIcon size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="+234..."
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 sm:py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:bg-white focus:border-primary-600 transition-all font-medium text-sm sm:text-base"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-400 font-medium">Include country code for the direct WhatsApp link to work.</p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:bg-white focus:border-primary-600 transition-all font-medium text-sm sm:text-base appearance-none"
                  >
                    <option value="">Select State</option>
                    {Array.isArray(states) && states.map(state => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">LGA</label>
                  <select
                    value={formData.lga}
                    onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                    disabled={!formData.state}
                    className="w-full px-4 py-3 sm:py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:bg-white focus:border-primary-600 transition-all font-medium text-sm sm:text-base appearance-none disabled:opacity-50"
                  >
                    <option value="">Select LGA</option>
                    {Array.isArray(lgas) && lgas.map(lga => (
                      <option key={lga.id} value={lga.id}>{lga.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">Public Bio</label>
                <textarea
                  rows={6}
                  placeholder="Tell the community about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:bg-white focus:border-primary-600 transition-all font-medium resize-none text-sm sm:text-base"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-4 bg-[#008000] text-white rounded-[18px] font-black text-lg hover:bg-zinc-800 transition-all shadow-xl shadow-primary-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckmarkCircle01Icon size={22} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;

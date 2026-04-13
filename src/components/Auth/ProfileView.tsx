import React, { useEffect, useState } from 'react';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { ProfileData } from '../../types';
import { User, Calendar, Mail, ShieldCheck, Clock, Loader2, LogOut, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const ProfileView = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { setUser, logout } = useAuthStore();
  const { setCurrentView } = useAppStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getProfile();
        if (response.success) {
          setProfile(response.context);
          setUser(response.context); // Update store with latest data
        }
      } catch (err) {
        setError('Failed to load profile information.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center spotify-gradient">
        <Loader2 className="animate-spin text-spotify-green" size={48} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 spotify-gradient transition-colors duration-300">
        <p className="text-red-500 font-medium">{error || 'Profile not found'}</p>
        <button 
          onClick={() => setCurrentView('home')}
          className="bg-app-text text-spotify-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 spotify-gradient transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-spotify-gray hover:text-app-text transition-colors mb-6 md:mb-8 group text-sm"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-spotify-dark rounded-2xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/5 transition-colors duration-300"
        >
          {/* Cover Header */}
          <div className="h-32 md:h-48 bg-gradient-to-r from-spotify-green/20 to-spotify-green/5 relative">
            <div className="absolute -bottom-12 md:-bottom-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-spotify-light border-4 border-spotify-dark flex items-center justify-center shadow-2xl transition-colors">
                <User size={48} className="text-spotify-green md:hidden" />
                <User size={64} className="text-spotify-green hidden md:block" />
              </div>
            </div>
          </div>

          <div className="pt-16 md:pt-20 pb-8 md:pb-10 px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
              <div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2 text-app-text transition-colors">{profile.fullname}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-spotify-gray">
                  <Mail size={16} />
                  <span className="text-sm md:text-base">{profile.email}</span>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/10 hover:bg-red-500/20 hover:text-red-500 text-app-text font-bold py-2.5 md:py-3 px-8 rounded-full transition-all border border-black/10 dark:border-white/10 text-sm md:text-base"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="bg-black/5 dark:bg-white/5 p-6 rounded-xl border border-black/5 dark:border-white/5 space-y-4 transition-colors">
                <h3 className="text-spotify-gray text-xs font-bold uppercase tracking-widest">Account Details</h3>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-spotify-green/10 flex items-center justify-center text-spotify-green">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-spotify-gray">Status</p>
                    <p className="font-medium text-app-text">{profile.status ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-spotify-gray">Member Since</p>
                    <p className="font-medium text-app-text">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/5 dark:bg-white/5 p-6 rounded-xl border border-black/5 dark:border-white/5 space-y-4 transition-colors">
                <h3 className="text-spotify-gray text-xs font-bold uppercase tracking-widest">System Info</h3>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-spotify-gray">Last Updated</p>
                    <p className="font-medium text-app-text">{formatDate(profile.updated_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-spotify-gray">Account ID</p>
                    <p className="font-medium text-app-text">#{profile.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

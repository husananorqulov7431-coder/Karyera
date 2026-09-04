import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleUserAccount } from '../types';
import { sfxClick, sfxCardFlip, sfxWhistle } from '../utils/audio';
import {
  TELEGRAM_BOT_USERNAME,
  PRIMARY_ADMIN_CHAT_ID,
  verifyAdminConfirmationCode,
  sendTelegramVerificationCode,
  notifyAdminLoginToTelegram
} from '../utils/googleAuth';
import {
  UserProfile,
  getAllSavedAccounts,
  getActiveAccount,
  switchAccount,
  createNewAccount,
  changeAccountPassword,
  loginAsAdmin,
  authenticateUserWithFallback,
  toGoogleUserAccount,
  deleteAccount,
  createDefaultGuestProfile
} from '../utils/userStore';
import {
  Shield,
  User,
  LogIn,
  CheckCircle2,
  Lock,
  Unlock,
  X,
  Trophy,
  Coins,
  Zap,
  LogOut,
  KeyRound,
  Send,
  AlertTriangle,
  ExternalLink,
  Users,
  UserPlus,
  RefreshCw,
  Sparkles,
  Check,
  Copy,
  Info
} from 'lucide-react';

interface GoogleAuthModalProps {
  currentUser: GoogleUserAccount | null;
  onLogin: (user: GoogleUserAccount) => void;
  onLogout: () => void;
  onClose: () => void;
  onOpenAdminPackManager?: () => void;
  onOpenAdminManager?: () => void;
  squadRating?: number;
  clubBudget?: number;
  initialTab?: 'my_profile' | 'accounts' | 'admin_login' | 'telegram_login' | 'register' | 'password_change';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onClose,
  onOpenAdminPackManager,
  onOpenAdminManager,
  initialTab = 'my_profile'
}) => {
  const handleOpenAdminModal = onOpenAdminPackManager || onOpenAdminManager;

  // Active Tab: 'my_profile' | 'accounts' | 'admin_login' | 'telegram_login' | 'register' | 'password_change'
  const [activeTab, setActiveTab] = useState<
    'my_profile' | 'accounts' | 'admin_login' | 'telegram_login' | 'register' | 'password_change'
  >(() => {
    if (initialTab) return initialTab;
    if (!currentUser || !currentUser.email) return 'telegram_login';
    return 'my_profile';
  });

  // Local accounts state
  const [savedAccounts, setSavedAccounts] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  // Status & Feedback states
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Form states: Admin Login
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isSendingTelegramCode, setIsSendingTelegramCode] = useState(false);

  // Form states: Telegram / Manager ID Login
  const [managerIdInput, setManagerIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Form states: Register New Account
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Form states: Password Change
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Reload accounts on open
  useEffect(() => {
    refreshAccounts();
  }, []);

  const refreshAccounts = () => {
    const list = getAllSavedAccounts();
    setSavedAccounts(list);
    const active = getActiveAccount();
    setActiveProfile(active);
  };

  // Copy Manager ID to clipboard
  const handleCopyManagerId = (id: string) => {
    sfxClick();
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // 1. Switch account
  const handleSwitchAccount = (accountId: string) => {
    sfxClick();
    setErrorMessage(null);
    setStatusMessage(null);
    const result = switchAccount(accountId);
    if (result.success && result.account) {
      sfxWhistle();
      const googleUser = toGoogleUserAccount(result.account);
      onLogin(googleUser);
      refreshAccounts();
      setStatusMessage(`✅ "${result.account.displayName}" hisobiga muvaffaqiyatli o‘tildi!`);
      setActiveTab('my_profile');
    } else {
      setErrorMessage(result.error || 'Hisobni almashtirib bo‘lmadi.');
    }
  };

  // 2. Admin Login
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sfxClick();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const res = loginAsAdmin(adminPasswordInput);
      if (res.success && res.account) {
        sfxWhistle();
        const googleUser = toGoogleUserAccount(res.account);
        onLogin(googleUser);
        refreshAccounts();
        setStatusMessage("👑 Bosh Administrator sifatida tizimga muvaffaqiyatli kirdingiz!");
        notifyAdminLoginToTelegram('geminiai7431@gmail.com', res.account.displayName);
        setActiveTab('my_profile');
        setAdminPasswordInput('');
      } else {
        setErrorMessage(res.error || "Admin paroli noto'g'ri!");
      }
    }, 200);
  };

  // Telegram bot orqali tasdiq kodi so'rash
  const handleRequestTelegramOtp = async () => {
    sfxClick();
    setIsSendingTelegramCode(true);
    setErrorMessage(null);
    setStatusMessage(null);
    const res = await sendTelegramVerificationCode(PRIMARY_ADMIN_CHAT_ID);
    setIsSendingTelegramCode(false);
    if (res.success) {
      setStatusMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  // 3. Telegram / Manager ID Login with 3-second Web Fallback
  const handleTelegramAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sfxClick();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsProcessing(true);

    const result = await authenticateUserWithFallback({
      managerIdOrUsername: managerIdInput,
      password: passwordInput
    });

    setIsProcessing(false);

    if (result.success && result.account) {
      sfxWhistle();
      const googleUser = toGoogleUserAccount(result.account);
      onLogin(googleUser);
      refreshAccounts();
      setStatusMessage(result.notice || `Xush kelibsiz, ${result.account.displayName}!`);
      setActiveTab('my_profile');
      setPasswordInput('');
    } else {
      setErrorMessage(result.error || "Hisob ma'lumotlari noto'g'ri!");
    }
  };

  // 4. Register New Account
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sfxClick();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Iltimos, ism yoki jamoa nomini kiriting!');
      return;
    }

    if (regPassword && regPassword.length < 4) {
      setErrorMessage('Parol kamida 4 ta belgidan iborat bo‘lishi kerak!');
      return;
    }

    setIsProcessing(true);
    const res = createNewAccount({
      displayName: regName,
      username: regUsername,
      password: regPassword || '123456',
      role: 'user'
    });

    setIsProcessing(false);

    if (res.success && res.account) {
      sfxWhistle();
      const googleUser = toGoogleUserAccount(res.account);
      onLogin(googleUser);
      refreshAccounts();
      setStatusMessage(`🎉 Yangi profil yaratildi! Sizning Menejer ID raqamingiz: ${res.account.managerId}`);
      setActiveTab('my_profile');
      setRegName('');
      setRegUsername('');
      setRegPassword('');
    } else {
      setErrorMessage(res.error || 'Akkaunt yaratishda xatolik!');
    }
  };

  // 5. Change Password (Strict Role-Based)
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sfxClick();
    setErrorMessage(null);
    setStatusMessage(null);

    const active = getActiveAccount();
    if (active.role === 'guest') {
      setErrorMessage("⚠️ Mehmon hisoblarda parol mavjud emas! Avval 'Yangi Akkaunt' bo‘limidan to‘liq ro‘yxatdan o‘ting.");
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMessage("Yangi parol va tasdiq paroli bir-biriga mos kelmadi!");
      return;
    }

    setIsProcessing(true);
    const res = await changeAccountPassword({
      accountId: active.id,
      currentPassword: currentPasswordInput,
      newPassword: newPasswordInput
    });
    setIsProcessing(false);

    if (res.success) {
      sfxWhistle();
      refreshAccounts();
      setStatusMessage(res.message || "Parol muvaffaqiyatli yangilandi!");
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } else {
      setErrorMessage(res.error || "Parolni o'zgartirishda xatolik!");
    }
  };

  // Logout / Switch to Guest
  const handleLogoutToGuest = () => {
    sfxClick();
    const guest = createDefaultGuestProfile();
    const list = getAllSavedAccounts();
    const updated = [guest, ...list.filter(a => a.role !== 'guest')];
    localStorage.setItem('efootball_accounts_v3', JSON.stringify(updated));
    localStorage.setItem('efootball_active_account_id_v3', guest.id);
    refreshAccounts();
    onLogout();
    setStatusMessage("Hisobdan chiqildi. Siz mehmon rejimidasiz.");
    setActiveTab('accounts');
  };

  const isCurrentAdmin = Boolean(currentUser?.isAdmin || activeProfile?.isAdmin);

  return (
    <div
      id="user_auth_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Header Ribbon */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              {isCurrentAdmin ? <Shield className="w-5 h-5 text-amber-400" /> : <Users className="w-5 h-5 text-cyan-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  {isCurrentAdmin ? 'Administrator & Profil Boshqaruvi' : 'eFootball Menejer Hisoblari'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isCurrentAdmin
                      ? 'bg-amber-400/20 border border-amber-400/50 text-amber-300'
                      : activeProfile?.role === 'user'
                      ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                      : 'bg-slate-700/50 text-slate-300'
                  }`}
                >
                  {isCurrentAdmin ? 'Admin' : activeProfile?.role === 'user' ? 'Menejer' : 'Mehmon'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bitta brauzerdan bir nechta akkauntlarni boshqaring va ajrating
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sfxClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Banners */}
        {statusMessage && (
          <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 p-2 mx-4 mt-3 bg-slate-950/60 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              sfxClick();
              setActiveTab('my_profile');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'my_profile'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Mening Profilim</span>
          </button>

          <button
            onClick={() => {
              sfxClick();
              setActiveTab('accounts');
              refreshAccounts();
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'accounts'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Akkauntlar ({savedAccounts.length})</span>
          </button>

          <button
            onClick={() => {
              sfxClick();
              setActiveTab('admin_login');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'admin_login'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>👑 Admin Kirish</span>
          </button>

          <button
            onClick={() => {
              sfxClick();
              setActiveTab('telegram_login');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'telegram_login'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>ID / Bot orqali</span>
          </button>

          <button
            onClick={() => {
              sfxClick();
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Yangi Akkaunt</span>
          </button>

          <button
            onClick={() => {
              sfxClick();
              setActiveTab('password_change');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'password_change'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Parol</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: MENING PROFILIM */}
          {activeTab === 'my_profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/20 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-cyan-400/40 flex-shrink-0 shadow-lg">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xl text-cyan-400">
                      {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}
                  {isCurrentAdmin && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 p-0.5 rounded-bl-lg font-black">
                      👑
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-base font-black text-white">
                      {currentUser?.displayName || activeProfile?.displayName || 'Mehmon Menejer'}
                    </h3>
                    {isCurrentAdmin && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                        Bosh Admin
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 font-mono">
                    <span>Menejer ID:</span>
                    <span className="text-cyan-300 font-bold">
                      {activeProfile?.managerId || currentUser?.managerId || 'Menejer ID belgilanmagan'}
                    </span>
                    {(activeProfile?.managerId || currentUser?.managerId) && (
                      <button
                        onClick={() => handleCopyManagerId(activeProfile?.managerId || currentUser?.managerId || '')}
                        className="p-1 hover:text-white transition-colors"
                        title="ID dan nusxa olish"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Rol: <span className="font-semibold text-slate-200">{isCurrentAdmin ? "Tizim Administratori (To'liq huquq)" : activeProfile?.role === 'user' ? "Oddiy O'yinchi" : "Mehmon (Vaqtinchalik)"}</span>
                  </div>
                </div>

                {/* GP & Balance Badge */}
                <div className="flex sm:flex-col items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-amber-300 text-sm font-black">
                    <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{(currentUser?.gp ?? activeProfile?.gp ?? 0).toLocaleString()} GP</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold">
                    <Coins className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{(currentUser?.eCoins ?? activeProfile?.eCoins ?? 0).toLocaleString()} eCoins</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {isCurrentAdmin && handleOpenAdminModal && (
                  <button
                    onClick={() => {
                      sfxClick();
                      onClose();
                      handleOpenAdminModal();
                    }}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>👑 Admin Pack Manager</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    sfxClick();
                    setActiveTab('accounts');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Boshqa Hisobga O‘tish</span>
                </button>

                <button
                  onClick={() => {
                    sfxClick();
                    setActiveTab('password_change');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Parolni O‘zgartirish</span>
                </button>

                <button
                  onClick={handleLogoutToGuest}
                  className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Hisobdan Chiqish</span>
                </button>
              </div>

              {/* Bot Link Notice */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-slate-300">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-cyan-300 font-bold">Telegram Bot:</span> Menejer balansingiz va o‘yinlaringiz Telegram botimiz (@{TELEGRAM_BOT_USERNAME}) bilan avtomatik sinxronlanadi. Agar bot vaqtinchalik o‘chiq bo‘lsa ham, barcha o‘zgarishlar veb xotirasida saqlanib qoladi.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BARCHA AKKAUNTLAR (MULTI-ACCOUNT SWITCHER) */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Brauzerdagi Saqlangan Hisoblar</h3>
                  <p className="text-xs text-slate-400">Kerakli hisob ustiga bosib darhol unga o‘tishingiz mumkin</p>
                </div>
                <button
                  onClick={() => {
                    sfxClick();
                    setActiveTab('register');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Yangi Qo‘shish</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {savedAccounts.map(acc => {
                  const isActive = acc.id === activeProfile?.id;
                  const isAccAdmin = acc.isAdmin || acc.role === 'admin';

                  return (
                    <div
                      key={acc.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950/50 hover:bg-slate-800/60 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-white/10 flex-shrink-0 flex items-center justify-center font-bold text-cyan-400">
                          {acc.photoURL ? (
                            <img src={acc.photoURL} alt={acc.displayName} className="w-full h-full object-cover" />
                          ) : (
                            acc.displayName[0]
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white truncate max-w-[150px] sm:max-w-[200px]">
                              {acc.displayName}
                            </span>
                            {isAccAdmin && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                👑 Admin
                              </span>
                            )}
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                                Faol
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                            <span>ID: {acc.managerId}</span>
                            <span>•</span>
                            <span className="text-amber-300 font-bold">{acc.gp.toLocaleString()} GP</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive ? (
                          <button
                            onClick={() => handleSwitchAccount(acc.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all cursor-pointer"
                          >
                            O‘tish
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Hozirgi</span>
                          </span>
                        )}

                        {!isAccAdmin && acc.role !== 'guest' && (
                          <button
                            onClick={() => {
                              sfxClick();
                              const res = deleteAccount(acc.id);
                              if (res.success && res.nextAccount) {
                                refreshAccounts();
                                onLogin(toGoogleUserAccount(res.nextAccount));
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Hisobni o‘chirish"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DEDICATED ADMIN LOGIN */}
          {activeTab === 'admin_login' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-xs">
                <Shield className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <div className="font-black text-sm text-white">Administrator Xavfsiz Kirish Tizimi</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    Ushbu bo‘lim faqat tizim bosh administratorlari uchun mo‘ljallangan. Bosh Admin parolini kiriting yoki Telegram botingizga yuborilgan tasdiq kodidan foydalaning.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Admin Paroli yoki Bosh Xavfsizlik Kaliti:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={e => setAdminPasswordInput(e.target.value)}
                    placeholder="Masalan: ANORQULOV_7431"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-amber-400/40 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing || !adminPasswordInput.trim()}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-400/20 disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  <span>{isProcessing ? 'Tekshirilmoqda...' : 'Admin Sifatida Kirish'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRequestTelegramOtp}
                  disabled={isSendingTelegramCode}
                  className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  title="Telegram bot orqali kod olish"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingTelegramCode ? 'Yuborilmoqda...' : 'Telegramga Kod Yuborish'}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center font-mono">
                Admin Chat ID: <span className="text-cyan-400 font-bold">6130389200</span> | Bot: <span className="text-cyan-400">@Futbolkarerapack_bot</span>
              </div>
            </form>
          )}

          {/* TAB 4: TELEGRAM BOT / MANAGER ID LOGIN (WITH 3S FALLBACK) */}
          {activeTab === 'telegram_login' && (
            <form onSubmit={handleTelegramAuthSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3 text-cyan-300 text-xs">
                <Sparkles className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-0.5" />
                <div>
                  <div className="font-black text-sm text-white">Menejer ID & Parol Bilan Kirish</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    Telegram botingiz bergan Menejer ID (masalan <span className="font-mono text-cyan-300">EF-6130389200</span>) va parolingizni kiriting.
                    Agar bot uyquda bo‘lsa ham tizim 3 soniya ichida Web rejimiga avtomatik ulanadi!
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Menejer ID yoki Telegram ID:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="text"
                    value={managerIdInput}
                    onChange={e => setManagerIdInput(e.target.value)}
                    placeholder="Masalan: EF-6130389200 yoki EF-743100"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Parol:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="Parolingizni kiriting"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-white text-sm focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing || !managerIdInput.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4 text-slate-950" />
                  <span>{isProcessing ? 'Tekshirilmoqda (3s limit)...' : 'Hisobga Kirish'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    sfxClick();
                    setActiveTab('register');
                  }}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  Hali hisobingiz yo‘qmi? Yangi ochish
                </button>
                <a
                  href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Telegram Bot</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </form>
          )}

          {/* TAB 5: YANGI AKKAUNT YARATISH */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3 text-cyan-300 text-xs">
                <UserPlus className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-0.5" />
                <div>
                  <div className="font-black text-sm text-white">Yangi Menejer Profili Ochish</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    Yangi mustaqil hisob yarating. Har bir hisob alohida jamoa, 1000 GP va €120M byudjetga ega bo‘ladi.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Menejer Ismi / Klub Nomi:
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Masalan: Bekzod FC yoki Husan Menejer"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-white text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Foydalanuvchi Nomi (Username, ixtiyoriy):
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder="Masalan: menejer_uzb"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Yangi Parol:
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Kamida 4 ta belgi"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-white text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing || !regName.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4 text-slate-950" />
                  <span>{isProcessing ? 'Yaratilmoqda...' : 'Akkauntni Faollashtirish'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: PAROLNI O'ZGARTIRISH */}
          {activeTab === 'password_change' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/20 flex items-start gap-3 text-xs">
                <KeyRound className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <div className="font-black text-sm text-white">Parolni Xavfsiz Yangilash</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    Hozirgi faol hisobingiz: <span className="font-bold text-cyan-300">{activeProfile?.displayName}</span> (Rol: <span className="font-bold text-amber-300">{activeProfile?.role}</span>).
                    {activeProfile?.role === 'guest'
                      ? " Diqqat: Mehmon akkaunt uchun parol yo‘q, avval ro‘yxatdan o‘ting!"
                      : " Joriy parolingizni kiritib yangi parol o‘rnating."}
                  </p>
                </div>
              </div>

              {activeProfile?.role === 'guest' ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400 mb-3">Mehmon hisobini to‘liq profilga aylantirish uchun yangi akkaunt yarating:</p>
                  <button
                    type="button"
                    onClick={() => {
                      sfxClick();
                      setActiveTab('register');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                  >
                    Yangi Akkaunt Ochish
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Joriy Parol:
                    </label>
                    <input
                      type="password"
                      value={currentPasswordInput}
                      onChange={e => setCurrentPasswordInput(e.target.value)}
                      placeholder="Hozirgi parolingizni kiriting"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-white text-sm focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Yangi Parol:
                    </label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      placeholder="Kamida 4 ta belgi"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-white text-sm focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Yangi Parolni Qayta Kiriting:
                    </label>
                    <input
                      type="password"
                      value={confirmPasswordInput}
                      onChange={e => setConfirmPasswordInput(e.target.value)}
                      placeholder="Yangi parolni tasdiqlang"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-white text-sm focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing || !newPasswordInput}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-400/20 disabled:opacity-50"
                    >
                      <KeyRound className="w-4 h-4 text-slate-950" />
                      <span>{isProcessing ? 'Saqlanmoqda...' : 'Yangi Parolni Saqlash'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

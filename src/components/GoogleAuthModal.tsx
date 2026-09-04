import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleUserAccount } from '../types';
import { sfxClick, sfxCardFlip, sfxWhistle } from '../utils/audio';
import {
  AUTHORIZED_ADMIN_EMAILS,
  TELEGRAM_BOT_USERNAME,
  PRIMARY_ADMIN_CHAT_ID,
  verifyAdminConfirmationCode,
  sendTelegramVerificationCode,
  notifyAdminLoginToTelegram,
  triggerGoogleSignInPopup,
  loginWithTelegramProfile,
  redirectToTelegramBot
} from '../utils/googleAuth';
import {
  Sparkles,
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
  Flame,
  LogOut,
  Settings,
  Eye,
  EyeOff,
  Edit2,
  Check,
  KeyRound,
  Send,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw
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
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onClose,
  onOpenAdminPackManager,
  onOpenAdminManager,
  squadRating = 88,
  clubBudget = 120000000
}) => {
  const handleOpenAdminModal = onOpenAdminPackManager || onOpenAdminManager;
  // Authentication form state
  const [emailInput, setEmailInput] = useState(currentUser?.email || '');
  const [nameInput, setNameInput] = useState(currentUser?.displayName || '');
  const [googlePhotoUrl, setGooglePhotoUrl] = useState(currentUser?.photoURL || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // 2-Bosqichli Admin Tasdiq Amallari State
  const [step, setStep] = useState<'login' | 'admin_2fa'>('login');
  const [adminConfirmationCode, setAdminConfirmationCode] = useState('');
  const [telegramChatId, setTelegramChatId] = useState(PRIMARY_ADMIN_CHAT_ID);
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [telegramSendStatus, setTelegramSendStatus] = useState<string | null>(null);
  const [pendingAccount, setPendingAccount] = useState<GoogleUserAccount | null>(null);

  // Profile tahrirlash holati
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.displayName || '');
  const [hideEmail, setHideEmail] = useState(currentUser?.hideEmail ?? true);
  const [showDirectAdminUnlock, setShowDirectAdminUnlock] = useState(false);
  const [directUnlockMessage, setDirectUnlockMessage] = useState<string | null>(null);

  // Telegram Bot Profil Tizimi State
  const [authMethodTab, setAuthMethodTab] = useState<'telegram' | 'google'>('telegram');
  const [managerIdInput, setManagerIdInput] = useState(currentUser?.managerId || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [isTelegramSubmitting, setIsTelegramSubmitting] = useState(false);

  // Telegram orqali kirish amali
  const handleTelegramAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsTelegramSubmitting(true);
    sfxClick();

    const result = await loginWithTelegramProfile(managerIdInput, passwordInput);
    setIsTelegramSubmitting(false);

    if (result.success && result.user) {
      sfxWhistle();
      onLogin(result.user);
      setAuthSuccess(`Xush kelibsiz, ${result.user.displayName}! Profilingizga muvaffaqiyatli kirdingiz.`);
    } else {
      setAuthError(result.error || "Menejer ID yoki parol noto'g'ri!");
    }
  };

  // Telegram botga o'tib profil yaratish
  const handleCreateProfileInBot = () => {
    sfxClick();
    redirectToTelegramBot('register');
  };

  // Emailni maskalash: user... -> u***@gmail.com
  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return '••••••••••••';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user[0]}${'*'.repeat(Math.min(user.length - 2, 6))}${user[user.length - 1]}@${domain}`;
  };

  // 1. Haqiqiy Google orqali kirish (Google Identity Services / OAuth 2.0 popup)
  const handleRealGoogleSignIn = () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);
    sfxClick();

    triggerGoogleSignInPopup({
      onSuccess: (profile) => {
        setIsSubmitting(false);
        sfxWhistle();
        const cleanEmail = profile.email.toLowerCase();
        const isOwnerEmail = AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail);

        const newAccount: GoogleUserAccount = {
          email: cleanEmail,
          displayName: profile.name || cleanEmail.split('@')[0],
          photoURL: profile.picture,
          hideEmail: true,
          isAdmin: false, // Boshlang'ich admin holati soxta bo'lmasligi uchun false, tasdiqdan so'ng true bo'ladi!
          isGoogleVerified: true,
          authMethod: 'google_oauth',
          googleSub: profile.sub,
          gp: currentUser?.gp ?? (isOwnerEmail ? 5000 : 1000),
          eCoins: currentUser?.eCoins ?? 300,
          matchesPlayed: currentUser?.matchesPlayed ?? 0,
          matchesWon: currentUser?.matchesWon ?? 0,
          matchesDrawn: currentUser?.matchesDrawn ?? 0,
          matchesLost: currentUser?.matchesLost ?? 0,
          goalsScored: currentUser?.goalsScored ?? 0,
          goalsConceded: currentUser?.goalsConceded ?? 0,
          signedInAt: Date.now()
        };

        if (isOwnerEmail) {
          // Tizim egasi aniqlandi! Birov soxta nom bilan kirmasligi uchun 2-bosqichli Tasdiq Amali talab qilinadi
          setPendingAccount(newAccount);
          setStep('admin_2fa');
          setAuthSuccess('✅ Google hisobingiz aniqlandi. Tasdiqlash kodi Telegram botingizga yuborilmoqda...');
          setIsSendingTelegram(true);
          sendTelegramVerificationCode(PRIMARY_ADMIN_CHAT_ID).then((res) => {
            setIsSendingTelegram(false);
            if (res.success) {
              setTelegramSendStatus(`✅ Tasdiq kodi Telegram botingizga (@${TELEGRAM_BOT_USERNAME} / ID: ${PRIMARY_ADMIN_CHAT_ID}) yuborildi!`);
            } else {
              setTelegramSendStatus(res.message);
            }
          });
        } else {
          // Oddiy foydalanuvchi muvaffaqiyatli kirdi
          onLogin(newAccount);
          setAuthSuccess(`Xush kelibsiz, ${newAccount.displayName}! O‘yinchi profili faollashtirildi.`);
        }
      },
      onError: (err) => {
        setIsSubmitting(false);
        setAuthError(err || 'Google orqali kirish amalga oshmadi. Email orqali sinab ko‘ring.');
      }
    });
  };

  // 2. Email orqali hisob ochish / tizimga ulanish
  const handleEmailFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Iltimos, to‘g‘ri Google email manzilini kiriting');
      return;
    }

    setIsSubmitting(true);
    sfxClick();

    setTimeout(() => {
      setIsSubmitting(false);
      const isOwnerEmail = AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail);
      const managerName = nameInput.trim() || cleanEmail.split('@')[0].toUpperCase();

      const candidateAccount: GoogleUserAccount = {
        email: cleanEmail,
        displayName: managerName,
        photoURL: googlePhotoUrl || undefined,
        hideEmail: true,
        isAdmin: false, // Hech kim shunchaki email yozib admin bo'la olmaydi!
        isGoogleVerified: isOwnerEmail,
        authMethod: 'email_code',
        gp: currentUser?.gp ?? (isOwnerEmail ? 5000 : 1000),
        eCoins: currentUser?.eCoins ?? 300,
        matchesPlayed: currentUser?.matchesPlayed ?? 0,
        matchesWon: currentUser?.matchesWon ?? 0,
        matchesDrawn: currentUser?.matchesDrawn ?? 0,
        matchesLost: currentUser?.matchesLost ?? 0,
        goalsScored: currentUser?.goalsScored ?? 0,
        goalsConceded: currentUser?.goalsConceded ?? 0,
        signedInAt: Date.now()
      };

      if (isOwnerEmail) {
        // Tizim egasi hisobi kiritildi: 2-bosqichli Tasdiq amali boshlanadi!
        setPendingAccount(candidateAccount);
        setStep('admin_2fa');
        setAuthSuccess('✅ Hisob aniqlandi! Tasdiqlash kodi Telegram botingizga yuborilmoqda...');
        setIsSendingTelegram(true);
        sendTelegramVerificationCode(PRIMARY_ADMIN_CHAT_ID).then((res) => {
          setIsSendingTelegram(false);
          if (res.success) {
            setTelegramSendStatus(`✅ Tasdiq kodi Telegram botingizga (@${TELEGRAM_BOT_USERNAME} / ID: ${PRIMARY_ADMIN_CHAT_ID}) yuborildi!`);
          } else {
            setTelegramSendStatus(res.message);
          }
        });
      } else {
        // Oddiy o'yinchi profili
        onLogin(candidateAccount);
        sfxWhistle();
      }
    }, 300);
  };

  // 3. Admin Tasdiq Kodini Tekshirish ("Tasdiq Amali")
  const handleVerifyAdminConfirmation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    if (!adminConfirmationCode.trim()) {
      setAuthError('Iltimos, tasdiqlash kodini kiriting.');
      return;
    }

    sfxClick();
    const isValid = verifyAdminConfirmationCode(adminConfirmationCode);

    if (isValid) {
      sfxCardFlip();
      const targetUser = pendingAccount || currentUser;
      if (!targetUser) {
        setAuthError('Foydalanuvchi ma‘lumotlari topilmadi.');
        return;
      }

      const verifiedAdminUser: GoogleUserAccount = {
        ...targetUser,
        isAdmin: true,
        adminVerified: true,
        adminVerifiedAt: Date.now(),
        isGoogleVerified: true
      };

      onLogin(verifiedAdminUser);
      notifyAdminLoginToTelegram(verifiedAdminUser.email, verifiedAdminUser.displayName, PRIMARY_ADMIN_CHAT_ID);
      setStep('login');
      setPendingAccount(null);
      setAuthSuccess('👑 Tabriklaymiz! Google va Tasdiq Amallari orqali Rasmiy Adminlik to‘liq tasdiqlandi!');
      sfxWhistle();
    } else {
      setAuthError('❌ Noto‘g‘ri tasdiqlash kodi! Telegram botingizdagi eng so‘nggi kodni tekshiring.');
    }
  };

  // 4. Telegram orqali Tasdiq Kodini Yuborish
  const handleSendTelegramCode = async () => {
    if (!telegramChatId.trim()) {
      setTelegramSendStatus('⚠️ Iltimos, Telegram Chat ID raqamingizni kiriting.');
      return;
    }

    setIsSendingTelegram(true);
    setTelegramSendStatus(null);
    sfxClick();

    const res = await sendTelegramVerificationCode(telegramChatId);
    setIsSendingTelegram(false);

    if (res.success) {
      setTelegramSendStatus('✅ Kod Telegram botingizga yuborildi! Xabarni tekshiring.');
    } else {
      setTelegramSendStatus(`❌ Xatolik: ${res.message}`);
    }
  };

  // Profile ichida ismni yangilash
  const handleSaveName = () => {
    if (!currentUser || !editedName.trim()) return;
    sfxClick();
    onLogin({
      ...currentUser,
      displayName: editedName.trim()
    });
    setIsEditingName(false);
  };

  // Profile ichida email yashirish/ko'rsatish
  const handleToggleHideEmail = () => {
    if (!currentUser) return;
    sfxClick();
    const next = !hideEmail;
    setHideEmail(next);
    onLogin({
      ...currentUser,
      hideEmail: next
    });
  };

  const winRate =
    currentUser && currentUser.matchesPlayed > 0
      ? Math.round((currentUser.matchesWon / currentUser.matchesPlayed) * 100)
      : currentUser?.matchesWon
      ? 100
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative max-w-lg w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden my-auto"
      >
        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= STEP 2: ADMIN 2-BOSQICHLI TASDIQ AMALI ================= */}
        {step === 'admin_2fa' ? (
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 p-3 shadow-xl mb-2 flex items-center justify-center text-white">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Adminlikni Tasdiqlash
              </h2>
              <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold mt-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>{pendingAccount?.email}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                Ushbu hisob egasi nomidan boshqalar kirishining oldini olish uchun 
                <strong> 2-bosqichli Tasdiq Amali</strong> talab qilinadi.
              </p>
            </div>

            {/* Telegram Bot Direct Access Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Send className="w-4 h-4" />
                  <span>Telegram Bot orqali Tasdiqlash</span>
                </div>
                <a
                  href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Botga o‘tish</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                Botimizda <code className="text-white bg-slate-800 px-1 py-0.5 rounded">/tasdiq</code> buyrug‘ini yuboring yoki 
                <strong className="text-amber-300"> "🔐 Admin Kirish Tasdiq Kodi"</strong> tugmasini bosib 6 xonali kodni oling.
              </div>

              {/* Chat ID orqali botdan to'g'ridan-to'g'ri kod so'rash */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Asosiy Admin Telegram ID:</span>
                  <span className="font-mono text-cyan-300 font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                    6130389200
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Telegram Chat ID (Masalan: 6130389200)"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendTelegramCode}
                    disabled={isSendingTelegram}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg shadow-cyan-900/30"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingTelegram ? 'Yuborilmoqda...' : 'Kod Yuborish'}</span>
                  </button>
                </div>
                {telegramSendStatus && (
                  <div className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{telegramSendStatus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tasdiq kodini kiritish formasi */}
            <form onSubmit={handleVerifyAdminConfirmation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  6 Xonali Tasdiq Kodi yoki Maxfiy Kalit
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="Masalan: 743199 yoki Maxfiy Kalit"
                    value={adminConfirmationCode}
                    onChange={(e) => setAdminConfirmationCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-amber-500/60 text-white placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:border-amber-400"
                  />
                  <KeyRound className="w-4 h-4 text-amber-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    // Bekor qilish va oddiy o'yinchi sifatida davom etish
                    if (pendingAccount) {
                      onLogin({ ...pendingAccount, isAdmin: false });
                    }
                    setStep('login');
                  }}
                  className="w-1/3 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tasdiqlash & Admin Bo‘lish</span>
                </button>
              </div>
            </form>
          </div>
        ) : currentUser ? (
          /* ================= ALREADY LOGGED IN: VERIFIED SECURE PLAYER PROFILE ================= */
          <div className="space-y-6">
            {/* Header: Google Badge, Safe Name & Privacy */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl border-2 border-cyan-400/60 object-cover shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 border-2 border-cyan-400/60 p-1 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                  {currentUser.displayName.substring(0, 2).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-400 text-white font-black text-base focus:outline-none"
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {currentUser.displayName}
                      </h2>
                      <button
                        onClick={() => {
                          setEditedName(currentUser.displayName);
                          setIsEditingName(true);
                        }}
                        className="text-slate-400 hover:text-cyan-400 p-1 cursor-pointer"
                        title="Ismni o'zgartirish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <div
                    className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-900 shadow"
                    title="Google orqali tasdiqlangan"
                  >
                    G
                  </div>

                  {currentUser.isAdmin ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>ADMIN</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-400/20 border border-cyan-400/50 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                      OYINCHI
                    </span>
                  )}
                </div>

                {/* Email with privacy masking */}
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                  <span>{hideEmail ? maskEmail(currentUser.email) : currentUser.email || 'Mehmon Hisobi'}</span>
                  {currentUser.email && (
                    <button
                      onClick={handleToggleHideEmail}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
                      title={hideEmail ? "Emailni ko'rsatish" : "Emailni yashirish"}
                    >
                      {hideEmail ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold flex items-center gap-1">
                    <span>Menejer ID:</span>
                    <strong className="text-white tracking-wider">{currentUser.managerId || (currentUser.telegramId ? `EF-${currentUser.telegramId}` : 'EF-USER')}</strong>
                  </span>
                  {currentUser.telegramId && (
                    <span className="px-2 py-0.5 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300 font-mono text-[11px] font-bold">
                      TG: @{currentUser.telegramUsername || currentUser.telegramId}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-cyan-400 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>eFootball 2026 Rasmiy O‘yinchi Profili</span>
                </div>
              </div>
            </div>

            {/* Currency Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">GP Balans</div>
                  <div className="text-lg font-black text-amber-300">
                    {currentUser.gp.toLocaleString()} GP
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-500/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-black">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">eFootball Coins</div>
                  <div className="text-lg font-black text-cyan-300">
                    {currentUser.eCoins.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Match Career Statistics */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Karyera O‘yinlari Ko‘rsatkichlari</span>
                </span>
                <span className="text-emerald-400 font-mono">
                  G‘alaba: {winRate}%
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">O‘yinlar</div>
                  <div className="text-sm font-black text-white">{currentUser.matchesPlayed}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-emerald-400">G‘alaba</div>
                  <div className="text-sm font-black text-emerald-300">{currentUser.matchesWon}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-amber-400">Durang</div>
                  <div className="text-sm font-black text-amber-300">{currentUser.matchesDrawn}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-red-400">Mag‘lubiyat</div>
                  <div className="text-sm font-black text-red-300">{currentUser.matchesLost}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Urilgan gollar: <strong className="text-white">{currentUser.goalsScored}</strong></span>
                <span>O‘tkazilgan: <strong className="text-white">{currentUser.goalsConceded}</strong></span>
                <span>Jamoa OVR: <strong className="text-amber-300">{squadRating}</strong></span>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sfxClick();
                  redirectToTelegramBot('password');
                }}
                className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                title="Bot orqali parolni xavfsiz yangilash"
              >
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>🔑 Parolni Botda O'zgartirish</span>
              </button>

              {currentUser.isAdmin && handleOpenAdminModal && (
                <button
                  onClick={() => {
                    sfxClick();
                    onClose();
                    handleOpenAdminModal();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span>Packlar Boshqaruvi</span>
                </button>
              )}

              <button
                onClick={() => {
                  sfxClick();
                  onLogout();
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= NOT LOGGED IN: TELEGRAM PROFILE & GOOGLE AUTH ================= */
          <div className="space-y-5">
            {/* Method Tabs */}
            <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  sfxClick();
                  setAuthMethodTab('telegram');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMethodTab === 'telegram'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram Bot Profil</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sfxClick();
                  setAuthMethodTab('google');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMethodTab === 'google'
                    ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Hisob</span>
              </button>
            </div>

            {authMethodTab === 'telegram' ? (
              /* TELEGRAM BOT PROFILE TAB */
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Telegram Menejer Profili
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Botimiz (@{TELEGRAM_BOT_USERNAME}) orqali berilgan shaxsiy <b>Menejer ID</b> va bir martalik parolingiz bilan kiring.
                  </p>
                </div>

                {/* Step 1: Botga O'tish va ID Olish */}
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Profilingiz yo'qmi yoki ID kerakmi?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateProfileInBot}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 hover:from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>🚀 @{TELEGRAM_BOT_USERNAME} ga O'tish (ID & Parol Olish)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </button>
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Botga kiring va <b>/start</b> buyrug'ini bosing. Bot sizga Menejer ID va bir martalik parol taqdim etadi.
                  </p>
                </div>

                {/* Step 2: Kirish Formasi */}
                <form onSubmit={handleTelegramAuthSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Menejer ID Raqami
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: EF-6130389200 yoki EF-743100"
                      value={managerIdInput}
                      onChange={(e) => setManagerIdInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300 block">
                        Parol
                      </label>
                      <button
                        type="button"
                        onClick={handleCreateProfileInBot}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                      >
                        Parolni unutdingizmi?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Bir martalik yoki yangi parolingiz"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {authError && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{authSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isTelegramSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isTelegramSubmitting ? "Tekshirilmoqda..." : "⚽️ Profilga Kirish"}</span>
                  </button>
                </form>
              </div>
            ) : (
              /* GOOGLE AUTH TAB */
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Google Hisob Bilan Kirish
                  </h2>
                  <p className="text-xs text-slate-400">
                    Google hisobingiz orqali zaxira profildan foydalaning.
                  </p>
                </div>

                <button
                  onClick={handleRealGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider shadow transition-all flex items-center justify-center gap-3 cursor-pointer border border-slate-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isSubmitting ? 'Tekshirilmoqda...' : 'Google Orqali Kirish'}</span>
                </button>

                <div className="flex items-center gap-3 my-1">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    YOKI EMAIL ORQALI
                  </span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                <form onSubmit={handleEmailFormSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Email Manzili
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="masalan: geminiai7431@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Menejer Ismi
                    </label>
                    <input
                      type="text"
                      placeholder="Klub yoki menejer nomini kiriting"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {authError && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Email Bilan Kirish
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

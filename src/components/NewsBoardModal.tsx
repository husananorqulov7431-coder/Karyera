import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  InGameNews,
  GoogleUserAccount
} from '../types';
import {
  getUserVisibleNews,
  getAllNews,
  createInGameNews,
  deleteInGameNews,
  markNewsAsSeen
} from '../utils/newsStore';
import { sfxClick, sfxWhistle } from '../utils/audio';
import {
  Newspaper,
  X,
  Plus,
  Trash2,
  Clock,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface NewsBoardModalProps {
  currentUser: GoogleUserAccount | null;
  isAdmin: boolean;
  onClose: () => void;
}

export const NewsBoardModal: React.FC<NewsBoardModalProps> = ({
  currentUser,
  isAdmin,
  onClose
}) => {
  const [newsList, setNewsList] = useState<InGameNews[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Form states for Admin
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('YANGILIK');
  const [category, setCategory] = useState<'pack' | 'update' | 'event'>('pack');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Load visible news
  const refreshNews = () => {
    if (isAdmin) {
      setNewsList(getAllNews());
    } else {
      const visible = getUserVisibleNews(false);
      setNewsList(visible);
      // Mark unseen news as seen now
      visible.forEach(item => {
        markNewsAsSeen(item.id);
      });
    }
  };

  useEffect(() => {
    refreshNews();
  }, [isAdmin]);

  // Image upload handlers
  const handleFileUpload = (file: File) => {
    if (!file) return;
    sfxClick();
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    sfxWhistle();
    createInGameNews({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      category,
      createdBy: currentUser?.name || 'Konami Admin',
      priority: 'high'
    });

    setTitle('');
    setContent('');
    setImageUrl('');
    setIsCreating(false);
    setFeedback('✅ Yangilik e’lon qilindi! Foydalanuvchilar ko‘rgach 24 soat davomida ko‘rinadi.');
    refreshNews();
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = (id: string, itemTitle: string) => {
    sfxClick();
    if (window.confirm(`"${itemTitle}" xabarini o'chirishni tasdiqlaysizmi?`)) {
      deleteInGameNews(id);
      refreshNews();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white flex items-center gap-2">
                <span>O‘yin Yangiliklari & E’lonlar</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  24h Avto-O‘chish
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Yangi packlar, sovg'alar va muhim eFootball voqealari
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && !isCreating && (
              <button
                onClick={() => { sfxClick(); setIsCreating(true); }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-400/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yangi Yangilik</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Admin Create News Form */}
          {isAdmin && isCreating && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handlePublish}
              className="p-5 rounded-2xl bg-slate-950/80 border border-amber-400/40 space-y-4 shadow-xl mb-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-black text-sm text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Yangi E’lon / Yangilik Yaratish
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Bekor qilish
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Sarlavha (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masalan: Yangi Epic Afsonalar Paketi Chiqdi!"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Belgi / Badge
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-300 focus:border-amber-400 outline-none"
                  >
                    <option value="YANGILIK">🔥 YANGILIK</option>
                    <option value="YANGI PACK">🎁 YANGI PACK</option>
                    <option value="DIZAYN">🎨 YANGI DIZAYN</option>
                    <option value="SOVG‘A">⭐ SOVG‘A / GP</option>
                    <option value="MUHIM">⚠️ MUHIM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Yangilik Matni (Tavsif) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Yangilik haqida batafsil ma'lumot yozing..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-amber-400 outline-none resize-none"
                />
              </div>

              {/* Rasm yuklash yoki Link */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block">
                  Rasm yoki Banner (Fayl yoki Link)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      const el = document.getElementById('news-image-input') as HTMLInputElement;
                      el?.click();
                    }}
                    className="border border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-3 text-center bg-slate-900/40 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <input
                      id="news-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-300">Rasm faylini yuklash</span>
                  </div>

                  <div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Yoki rasm URL havolasi..."
                      className="w-full h-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                {imageUrl && (
                  <div className="relative mt-2 rounded-xl overflow-hidden max-h-40 border border-slate-700">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1 rounded bg-black/60 text-white hover:text-rose-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20"
                >
                  E’lon Qilish (Publish)
                </button>
              </div>
            </motion.form>
          )}

          {/* News Feed List */}
          {newsList.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Newspaper className="w-12 h-12 mx-auto text-slate-600 opacity-60" />
              <p className="text-sm font-bold text-slate-400">
                Hozircha yangi e’lonlar mavjud emas
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Barcha ko'rilgan yangiliklar 24 soatdan so'ng o'z-o'zidan tozalanadi.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {newsList.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3 relative overflow-hidden group shadow-lg"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                        {item.category === 'pack' ? '🎁 YANGI PACK' : item.category === 'event' ? '⚽ VOQEA' : '🔥 YANGILIK'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Xabarni o'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Title & Body */}
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>

                  {/* Image Attachment */}
                  {item.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-72 bg-slate-900 flex items-center justify-center">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover max-h-72"
                      />
                    </div>
                  )}

                  {/* Footer note */}
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                    <span>Muallif: {item.createdBy || 'Admin'}</span>
                    <span className="text-cyan-400 font-mono">👁️ 24 soatdan so‘ng o‘chadi</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Tattoo } from '@/types';

export default function AdminTattoosPage() {
  const [tattoos, setTattoos] = useState<Tattoo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('15');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTattoos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tattoos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setTattoos(data as Tattoo[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTattoos();
  }, []);

  const openForm = (tattoo?: Tattoo) => {
    if (tattoo) {
      setEditingId(tattoo.id);
      setTitle(tattoo.title);
      setDescription(tattoo.description || '');
      setBasePrice(tattoo.base_price?.toString() || '');
      setDiscountPercentage(tattoo.discount_percentage.toString());
      setIsActive(tattoo.is_active);
      setCurrentImageUrl(tattoo.image_url || '');
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setBasePrice('');
      setDiscountPercentage('15');
      setIsActive(true);
      setCurrentImageUrl('');
    }
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSaving(true);

    let finalImageUrl = currentImageUrl;

    // Handle Image Upload
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('tattoo-images')
        .upload(fileName, imageFile);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('tattoo-images')
          .getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }
    }

    const payload = {
      title,
      description: description || null,
      base_price: basePrice ? parseFloat(basePrice) : null,
      discount_percentage: parseInt(discountPercentage, 10) || 0,
      is_active: isActive,
      image_url: finalImageUrl || null,
    };

    if (editingId) {
      await supabase.from('tattoos').update(payload).eq('id', editingId);
    } else {
      await supabase.from('tattoos').insert(payload);
    }

    setSaving(false);
    setIsFormOpen(false);
    fetchTattoos();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-ink-100 tracking-widest mb-1">Tattoos</h2>
          <p className="text-ink-400 font-ui text-sm uppercase tracking-widest">Manage designs and rewards</p>
        </div>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-500 text-ink-950 font-ui text-xs uppercase tracking-widest rounded transition-colors"
        >
          <Plus size={16} /> New Tattoo
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tattoos.map((tattoo) => (
            <div key={tattoo.id} className={`bg-ink-900 border ${tattoo.is_active ? 'border-ink-800' : 'border-ink-800/50 opacity-60'} rounded-xl overflow-hidden flex flex-col`}>
              <div className="relative h-48 bg-ink-950 flex items-center justify-center border-b border-ink-800">
                {tattoo.image_url ? (
                  <Image src={tattoo.image_url} alt={tattoo.title} fill className="object-cover" />
                ) : (
                  <span className="text-4xl opacity-30">🖋️</span>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-ink-950/80 border border-ink-700 rounded text-[10px] font-ui uppercase tracking-wider text-gold-500">
                  {tattoo.discount_percentage}% OFF
                </div>
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-display text-xl text-ink-100 mb-1">{tattoo.title}</h3>
                <p className="text-ink-400 text-xs font-body line-clamp-2 mb-3">{tattoo.description || 'No description.'}</p>
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-ink-800">
                  <span className="text-ink-500 text-[10px] font-ui uppercase tracking-widest">
                    {tattoo.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => openForm(tattoo)} className="p-2 text-ink-400 hover:text-gold-500 transition-colors">
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/90 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-ink-900 border border-ink-700 rounded-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-ink-800">
              <h2 className="font-display text-xl text-gold-500 tracking-widest">{editingId ? 'Edit' : 'New'} Tattoo</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-ink-400 hover:text-ink-100"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Col */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-ink-400 text-[10px] font-ui uppercase tracking-widest mb-1">Title *</label>
                    <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-sm text-ink-100" />
                  </div>
                  <div>
                    <label className="block text-ink-400 text-[10px] font-ui uppercase tracking-widest mb-1">Description</label>
                    <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-sm text-ink-100 font-body" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-ink-400 text-[10px] font-ui uppercase tracking-widest mb-1">Discount % *</label>
                      <input required type="number" min="0" max="100" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-sm text-ink-100" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-ink-400 text-[10px] font-ui uppercase tracking-widest mb-1">Base Price (MKD)</label>
                      <input type="number" min="0" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-sm text-ink-100" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-gold-500" />
                    <label htmlFor="isActive" className="text-sm text-ink-300 font-ui uppercase tracking-widest">Active (available in game)</label>
                  </div>
                </div>

                {/* Right Col: Image */}
                <div>
                  <label className="block text-ink-400 text-[10px] font-ui uppercase tracking-widest mb-1">Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[3/4] border-2 border-dashed border-ink-700 rounded-lg bg-ink-950 flex flex-col items-center justify-center cursor-pointer hover:border-gold-500 hover:bg-ink-900 transition-all relative overflow-hidden"
                  >
                    {imageFile ? (
                      // Preview new file
                      <Image src={URL.createObjectURL(imageFile)} alt="Preview" fill className="object-cover" />
                    ) : currentImageUrl ? (
                      // Existing image
                      <Image src={currentImageUrl} alt="Current" fill className="object-cover" />
                    ) : (
                      <div className="text-center text-ink-500">
                        <Upload size={32} className="mx-auto mb-2" />
                        <span className="font-ui text-xs uppercase tracking-widest">Click to upload</span>
                      </div>
                    )}
                    {(imageFile || currentImageUrl) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-ui text-xs uppercase tracking-widest flex items-center gap-2"><Upload size={16}/> Change Image</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                  }} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-ink-800">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-ink-300 font-ui text-xs uppercase tracking-widest hover:text-ink-100">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center justify-center min-w-[120px] px-6 py-2 bg-gold-600 hover:bg-gold-500 text-ink-950 font-ui text-xs uppercase tracking-widest rounded disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Tattoo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

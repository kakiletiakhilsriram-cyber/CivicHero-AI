import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Camera, MapPin, Mail, Phone, Edit, Check } from 'lucide-react';

export default function ProfilePage({ user, onUpdate, onBack }: { user: UserProfile, onUpdate: (u: UserProfile) => void, onBack: () => void }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const save = async () => {
    try {
      const response = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const updatedUser = await response.json();
        onUpdate(updatedUser);
        setEditing(false);
      } else {
        const text = await response.text();
        console.error(text || 'Failed to update profile');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <button onClick={onBack} className="text-gray-500 font-bold">← Back</button>
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-start gap-8">
        <div className="relative">
          <img src={formData.photo} className="w-32 h-32 rounded-full object-cover" />
          <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white"><Camera size={16} /></button>
        </div>
        <div className="flex-1 space-y-2">
          {editing ? (
            <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="text-3xl font-bold w-full border-b" />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{formData.name}</h1>
          )}
          <p className="text-blue-600 font-bold">{formData.role}</p>
          <div className="flex gap-4 pt-2">
             <button onClick={() => editing ? save() : setEditing(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold">
               {editing ? <><Check size={16} className="inline mr-1" /> Save</> : <><Edit size={16} className="inline mr-1" /> Edit Profile</>}
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Points', value: formData.points },
          { label: 'Reports', value: formData.reportsCount },
          { label: 'Verified', value: formData.verifiedReports },
          { label: 'Trust Score', value: `${formData.trustScore}%` },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs font-bold uppercase">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

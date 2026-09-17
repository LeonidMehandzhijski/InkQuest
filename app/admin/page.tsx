'use client';

import { useEffect, useState } from 'react';
import { Users, Scan, CalendarClock, ExternalLink } from 'lucide-react';
import type { AdminStats } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStats(data);
        }
      })
      .catch((err) => setError('Failed to load stats.'));
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-950/30 border border-red-900 rounded text-red-400 font-body text-sm">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-400' },
    { label: 'Total Valid Scans', value: stats.total_scans, icon: Scan, color: 'text-green-400' },
    { label: 'Pending Bookings', value: stats.pending_bookings, icon: CalendarClock, color: 'text-gold-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl text-ink-100 tracking-widest mb-1">Dashboard</h2>
        <p className="text-ink-400 font-ui text-sm uppercase tracking-widest">Overview & Statistics</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-ink-900 border border-ink-800 rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-ink-400 font-ui text-[10px] uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="font-display text-4xl text-ink-100">{stat.value.toLocaleString()}</p>
            </div>
            <div className={`p-4 bg-ink-950 rounded-full ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-ink-900 border border-ink-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-ink-800">
          <h3 className="font-display text-xl text-ink-100 tracking-widest">Recent Booking Requests</h3>
        </div>
        
        {stats.recent_bookings.length === 0 ? (
          <div className="p-6 text-center text-ink-500 font-ui text-sm">
            No booking requests yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ink-950 text-ink-400 font-ui text-[10px] uppercase tracking-widest">
                  <th className="p-4 font-normal">Date</th>
                  <th className="p-4 font-normal">User</th>
                  <th className="p-4 font-normal">Tattoo</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800 font-body text-sm text-ink-300">
                {stats.recent_bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-ink-800/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">{booking.user?.email || 'Unknown'}</td>
                    <td className="p-4">
                      {booking.tattoo?.title}
                      <span className="ml-2 text-[10px] uppercase text-ink-500">
                        ({booking.tattoo?.rarity})
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-ui uppercase tracking-wider ${
                        booking.status === 'pending' ? 'bg-gold-900/30 text-gold-500 border border-gold-900' :
                        booking.status === 'booked' ? 'bg-green-900/30 text-green-500 border border-green-900' :
                        'bg-ink-800 text-ink-400 border border-ink-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-gold-500 hover:text-gold-400 flex items-center justify-end gap-1 ml-auto font-ui text-[10px] uppercase tracking-widest">
                        View <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

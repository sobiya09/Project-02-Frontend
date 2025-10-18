"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type Booking = {
  _id: string;
  user: { firstName?: string; lastName?: string; email?: string; phone?: string } | string | null;
  doctor: { firstName?: string; lastName?: string; email?: string; speciality?: string } | string | null;
  date: string;
  time: string;
  status: string;
  createdAt: string;
};

export default function DotorBookingDetailPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/consultation/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch consultations');
      setBookings(json.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = useMemo(() => {
    if (!search) return bookings;
    const q = search.toLowerCase();
    return bookings.filter(b => {
      const patient = typeof b.user === 'string'
        ? b.user
        : `${b.user?.firstName || ''} ${b.user?.lastName || ''} ${b.user?.email || ''}`;
      const doc = typeof b.doctor === 'string'
        ? b.doctor
        : `${b.doctor?.firstName || ''} ${b.doctor?.lastName || ''} ${b.doctor?.email || ''} ${b.doctor?.speciality || ''}`;
      return [patient, doc, b.date, b.time, b.status].some(v => (v || '').toString().toLowerCase().includes(q));
    });
  }, [bookings, search]);

  const formatDateTime = (d: string, t: string) => `${d} ${t}`;

  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="admin" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Doctor Booking Details</h1>

            <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between gap-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient/doctor/date/status"
                className="flex-1 border rounded px-3 py-2"
              />
              <button onClick={fetchBookings} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow">Refresh</button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speciality</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-500">Loading...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={5} className="px-6 py-6 text-center text-red-600">{error}</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-500">No bookings found</td></tr>
                  ) : (
                    filtered.map((b) => (
                      <tr key={b._id} className="border-t">
                        <td className="px-6 py-3">{typeof b.user === 'string' ? b.user : `${b.user?.firstName || ''} ${b.user?.lastName || ''}`}</td>
                        <td className="px-6 py-3">{typeof b.doctor === 'string' ? b.doctor : `${b.doctor?.firstName || ''} ${b.doctor?.lastName || ''}`}</td>
                        <td className="px-6 py-3">{typeof b.doctor === 'string' ? '' : b.doctor?.speciality || '-'}</td>
                        <td className="px-6 py-3">{formatDateTime(b.date, b.time)}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
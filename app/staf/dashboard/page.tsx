'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const statusInfo: Record<string, { label: string; color: string }> = {
  diajukan: { label: 'Diajukan', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  dokumen_tidak_lengkap: { label: 'Dokumen Tidak Lengkap', color: 'bg-red-50 text-red-700 border-red-200' },
  dokumen_lengkap: { label: 'Dokumen Lengkap', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  survey: { label: 'Survey Lokasi', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ditolak: { label: 'Ditolak', color: 'bg-red-50 text-red-700 border-red-200' },
  diterima: { label: 'Diterima', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  rekomtek_terbit: { label: 'Rekomtek Terbit', color: 'bg-green-50 text-green-700 border-green-200' },
  selesai: { label: 'Selesai', color: 'bg-green-50 text-green-700 border-green-200' },
}

const jenisLabel: Record<string, string> = {
  garis_sempadan: 'Garis Sempadan Jaringan Irigasi',
  akses_jalan_masuk: 'Sempadan Irigasi untuk Akses Jalan',
  pengalihan_saluran: 'Pengalihan Saluran Irigasi',
}

type Permohonan = {
  id: string
  nomor_tiket: string
  nama: string
  jenis_rekomendasi: string
  status: string
  created_at: string
}

export default function StafDashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [nama, setNama] = useState<string | null>(null)

  const [data, setData] = useState<Permohonan[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [filter, setFilter] = useState('semua')

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/staf/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('nama')
        .eq('id', session.user.id)
        .single()

      setNama(profile?.nama ?? session.user.email ?? 'Staf')
      setChecking(false)
      fetchPermohonan()
    }

    checkSession()
  }, [])

  async function fetchPermohonan() {
    setLoadingData(true)
    const { data, error } = await supabase
      .from('permohonan')
      .select('id, nomor_tiket, nama, jenis_rekomendasi, status, created_at')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setData(data)
    }
    setLoadingData(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/staf/login')
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Memeriksa sesi login...</p>
      </main>
    )
  }

  const filteredData =
    filter === 'semua' ? data : data.filter((p) => p.status === filter)

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
              Dinas Pekerjaan Umum dan Tata Ruang · Kota Tasikmalaya
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">
              Dashboard Bidang SDA
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{nama}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Daftar Permohonan ({filteredData.length})
          </h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="semua">Semua Status</option>
            {Object.entries(statusInfo).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {loadingData ? (
            <p className="p-6 text-sm text-slate-500">Memuat data...</p>
          ) : filteredData.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">Belum ada permohonan.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Nomor Tiket</th>
                  <th className="px-4 py-3 font-medium">Nama Pemohon</th>
                  <th className="px-4 py-3 font-medium">Jenis Permohonan</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((p) => {
                  const info = statusInfo[p.status]
                  return (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/staf/permohonan/${p.id}`}
                          className="font-mono font-medium text-blue-700 hover:underline"
                        >
                          {p.nomor_tiket}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-900">{p.nama}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {jenisLabel[p.jenis_rekomendasi] ?? p.jenis_rekomendasi}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(p.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {info && (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${info.color}`}
                          >
                            {info.label}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
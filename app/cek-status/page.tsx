'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600'

const labelClass = 'mb-1 block text-sm font-medium text-slate-700'

// Label & warna untuk tiap status
const statusInfo: Record<string, { label: string; color: string }> = {
  diajukan: { label: 'Permohonan Diajukan', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  dokumen_tidak_lengkap: { label: 'Dokumen Belum Lengkap', color: 'bg-red-50 text-red-700 border-red-200' },
  dokumen_lengkap: { label: 'Dokumen Lengkap · Menunggu Survey', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  survey: { label: 'Sedang Peninjauan Lapangan', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ditolak: { label: 'Permohonan Ditolak', color: 'bg-red-50 text-red-700 border-red-200' },
  diterima: { label: 'Diterima · Proses Rekomendasi Teknis', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  rekomtek_terbit: { label: 'Rekomendasi Teknis Terbit', color: 'bg-green-50 text-green-700 border-green-200' },
  selesai: { label: 'Selesai', color: 'bg-green-50 text-green-700 border-green-200' },
}

const jenisLabel: Record<string, string> = {
  garis_sempadan: 'Rekomendasi Garis Sempadan Jaringan Irigasi',
  akses_jalan_masuk: 'Rekomendasi Sempadan Irigasi untuk Akses Jalan Masuk',
  pengalihan_saluran: 'Rekomendasi Pengalihan Saluran Irigasi',
}

type HasilCek = {
  nomor_tiket: string
  jenis_rekomendasi: string
  status: string
  nama: string
  created_at: string
  updated_at: string
  catatan: string | null
  file_pdf_url: string | null
}

type TiketDitemukan = {
  nomor_tiket: string
  jenis_rekomendasi: string
  created_at: string
}

export default function CekStatusPage() {
  const supabase = createClient()
  const [nomorTiket, setNomorTiket] = useState('')
  const [noTelp, setNoTelp] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasil, setHasil] = useState<HasilCek | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State untuk fitur "lupa nomor tiket"
  const [showLupaTiket, setShowLupaTiket] = useState(false)
  const [lupaNoTelp, setLupaNoTelp] = useState('')
  const [lupaNama, setLupaNama] = useState('')
  const [lupaLoading, setLupaLoading] = useState(false)
  const [daftarTiket, setDaftarTiket] = useState<TiketDitemukan[] | null>(null)
  const [lupaNotFound, setLupaNotFound] = useState(false)

  async function handleCariTiket(e: React.FormEvent) {
    e.preventDefault()
    setLupaLoading(true)
    setLupaNotFound(false)
    setDaftarTiket(null)

    const { data, error } = await supabase.rpc('cari_nomor_tiket', {
      p_no_telp: lupaNoTelp.trim(),
      p_nama: lupaNama.trim(),
    })

    setLupaLoading(false)

    if (error || !data || data.length === 0) {
      setLupaNotFound(true)
      return
    }

    setDaftarTiket(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotFound(false)
    setHasil(null)

    const { data, error } = await supabase.rpc('cek_status_permohonan', {
      p_nomor_tiket: nomorTiket.trim(),
      p_no_telp: noTelp.trim(),
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (!data || data.length === 0) {
      setNotFound(true)
      return
    }

    setHasil(data[0])
  }

  const info = hasil ? statusInfo[hasil.status] : null

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-xl px-4 py-5">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Halaman Utama
          </Link>
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
            Dinas Pekerjaan Umum dan Tata Ruang · Kota Tasikmalaya
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            Cek Status Permohonan
          </h1>
          <p className="mt-1 text-sm text-slate-500">Bidang Sumber Daya Air</p>
        </div>
      </header>

      <div className="mx-auto mt-6 max-w-xl space-y-6 px-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
        >
          <div>
            <label className={labelClass}>Nomor Tiket</label>
            <input
              value={nomorTiket}
              onChange={(e) => setNomorTiket(e.target.value)}
              placeholder="REK-2026-0001"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nomor Telepon</label>
            <input
              value={noTelp}
              onChange={(e) => setNoTelp(e.target.value)}
              placeholder="081234567890"
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Mencari...' : 'Cek Status'}
          </button>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {notFound && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Data tidak ditemukan. Pastikan nomor tiket dan nomor telepon sudah benar.
            </p>
          )}

          <button
            type="button"
            onClick={() => setShowLupaTiket((v) => !v)}
            className="w-full text-center text-sm font-medium text-blue-700 hover:underline"
          >
            Lupa nomor tiket?
          </button>
        </form>

        {showLupaTiket && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-1 text-sm font-semibold text-slate-900">
              Cari Nomor Tiket
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Masukkan nomor telepon dan nama lengkap sesuai saat pengajuan.
            </p>
            <form onSubmit={handleCariTiket} className="space-y-4">
              <div>
                <label className={labelClass}>Nomor Telepon</label>
                <input
                  value={lupaNoTelp}
                  onChange={(e) => setLupaNoTelp(e.target.value)}
                  placeholder="081234567890"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Nama Lengkap</label>
                <input
                  value={lupaNama}
                  onChange={(e) => setLupaNama(e.target.value)}
                  placeholder="Sesuai nama saat mengajukan"
                  required
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={lupaLoading}
                className="w-full rounded-md border border-blue-700 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {lupaLoading ? 'Mencari...' : 'Cari Nomor Tiket'}
              </button>
            </form>

            {lupaNotFound && (
              <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Tidak ditemukan permohonan dengan data tersebut.
              </p>
            )}

            {daftarTiket && (
              <ul className="mt-4 space-y-2">
                {daftarTiket.map((t) => (
                  <li
                    key={t.nomor_tiket}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-mono font-semibold text-slate-900">
                        {t.nomor_tiket}
                      </p>
                      <p className="text-xs text-slate-500">
                        {jenisLabel[t.jenis_rekomendasi] ?? t.jenis_rekomendasi}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNomorTiket(t.nomor_tiket)
                        setShowLupaTiket(false)
                      }}
                      className="text-xs font-medium text-blue-700 hover:underline"
                    >
                      Pakai nomor ini
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {hasil && info && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">Nomor Tiket</p>
                <p className="font-mono text-lg font-semibold text-slate-900">
                  {hasil.nomor_tiket}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium ${info.color}`}
              >
                {info.label}
              </span>
            </div>

            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Pemohon</dt>
                <dd className="text-right text-slate-900">{hasil.nama}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Jenis Permohonan</dt>
                <dd className="text-right text-slate-900">
                  {jenisLabel[hasil.jenis_rekomendasi] ?? hasil.jenis_rekomendasi}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Diajukan</dt>
                <dd className="text-right text-slate-900">
                  {new Date(hasil.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Terakhir Diperbarui</dt>
                <dd className="text-right text-slate-900">
                  {new Date(hasil.updated_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            </dl>

            {hasil.catatan && (
              <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="mb-1 font-medium text-slate-700">Catatan</p>
                {hasil.catatan}
              </div>
            )}

            {hasil.file_pdf_url && (
              <a
                href={hasil.file_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full rounded-md bg-green-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Unduh Rekomendasi Teknis (PDF)
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
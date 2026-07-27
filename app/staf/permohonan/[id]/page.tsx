'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const statusInfo: Record<string, { label: string; color: string }> = {
  diajukan: { label: 'Diajukan', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  dokumen_tidak_lengkap: { label: 'Dokumen Tidak Lengkap', color: 'bg-red-50 text-red-700 border-red-200' },
  dokumen_lengkap: { label: 'Dokumen Lengkap', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  survey: { label: 'Survey Lokasi', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ditolak: { label: 'Ditolak', color: 'bg-red-50 text-red-700 border-red-200' },
  diterima: { label: 'Diterima', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  selesai: { label: 'Selesai', color: 'bg-green-50 text-green-700 border-green-200' },
}

const jenisLabel: Record<string, string> = {
  garis_sempadan: 'Rekomendasi Garis Sempadan Jaringan Irigasi',
  akses_jalan_masuk: 'Rekomendasi Sempadan Irigasi untuk Akses Jalan Masuk',
  pengalihan_saluran: 'Rekomendasi Pengalihan Saluran Irigasi',
}

const dokumenLabel: Record<string, string> = {
  ktp: 'Foto Copy KTP',
  sertifikat: 'Foto Copy Sertifikat / Letter C',
  akta: 'Foto Copy Akta Perusahaan',
  foto_lokasi: 'Foto Dokumentasi Lokasi',
  gambar_desain: 'Gambar Desain Rencana',
  surat_kesanggupan: 'Surat Pernyataan Kesanggupan',
  surat_tidak_keberatan: 'Surat Pernyataan Tidak Keberatan',
}

const btnPrimary =
  'rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60'
const btnDanger =
  'rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
const textareaClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600'

export default function DetailPermohonanPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [checking, setChecking] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [permohonan, setPermohonan] = useState<any>(null)
  const [dokumen, setDokumen] = useState<{ jenis_dokumen: string; url: string }[]>([])
  const [processing, setProcessing] = useState(false)

  const [catatanTidakLengkap, setCatatanTidakLengkap] = useState('')
  const [catatanSurvey, setCatatanSurvey] = useState('')
  const [catatanDitolak, setCatatanDitolak] = useState('')
  const [nomorRekomtek, setNomorRekomtek] = useState('')
  const [fileRekomtek, setFileRekomtek] = useState<File | null>(null)

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/staf/login')
        return
      }

      setUserId(session.user.id)
      setChecking(false)
      await loadData()
    }
    init()
  }, [])

  async function loadData() {
    const { data: p } = await supabase.from('permohonan').select('*').eq('id', id).single()
    setPermohonan(p)

    const { data: docs } = await supabase
      .from('dokumen_lampiran')
      .select('jenis_dokumen, file_url')
      .eq('permohonan_id', id)

    if (docs) {
      const withUrls = await Promise.all(
        docs.map(async (d) => {
          const { data: signed } = await supabase.storage
            .from('dokumen-pemohon')
            .createSignedUrl(d.file_url, 60 * 60)
          return { jenis_dokumen: d.jenis_dokumen, url: signed?.signedUrl ?? '#' }
        })
      )
      setDokumen(withUrls)
    }
  }

  async function catatRiwayat(statusSebelum: string, statusSesudah: string, catatan: string | null) {
    await supabase.from('riwayat_status').insert({
      permohonan_id: id,
      status_sebelum: statusSebelum,
      status_sesudah: statusSesudah,
      catatan,
      changed_by: userId,
    })
  }

  async function ubahStatus(statusBaru: string, catatan: string | null = null) {
    setProcessing(true)
    const statusLama = permohonan.status

    await supabase.from('permohonan').update({ status: statusBaru }).eq('id', id)
    await catatRiwayat(statusLama, statusBaru, catatan)

    setProcessing(false)
    await loadData()
  }

  async function handleDokumenLengkap() {
    setProcessing(true)
    await supabase.from('berita_acara').insert({
      permohonan_id: id,
      jenis_ba: 'dokumen_lengkap',
      dibuat_oleh: userId,
    })
    await ubahStatus('dokumen_lengkap')
  }

  async function handleDokumenTidakLengkap() {
    if (!catatanTidakLengkap.trim()) return
    await ubahStatus('dokumen_tidak_lengkap', catatanTidakLengkap.trim())
  }

  async function handleSelesaiSurvey() {
    setProcessing(true)
    await supabase.from('berita_acara').insert({
      permohonan_id: id,
      jenis_ba: 'peninjauan_lapangan',
      catatan: catatanSurvey.trim() || null,
      dibuat_oleh: userId,
    })
    await ubahStatus('survey', catatanSurvey.trim() || null)
  }

  async function handleDiterima() {
    await ubahStatus('diterima')
  }

  async function handleDitolak() {
    if (!catatanDitolak.trim()) return
    await ubahStatus('ditolak', catatanDitolak.trim())
  }

  async function handleUploadRekomtek() {
    if (!fileRekomtek || !nomorRekomtek.trim()) return
    setProcessing(true)

    const path = `${id}/${fileRekomtek.name}`
    const { error: uploadError } = await supabase.storage
      .from('rekomtek-pdf')
      .upload(path, fileRekomtek, { upsert: true })

    if (uploadError) {
      setProcessing(false)
      alert('Gagal upload: ' + uploadError.message)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('rekomtek-pdf').getPublicUrl(path)

    await supabase.from('rekomendasi_teknis').insert({
      permohonan_id: id,
      nomor_rekomtek: nomorRekomtek.trim(),
      file_pdf_url: publicUrl,
    })

    await supabase.from('permohonan').update({ nomor_surat: nomorRekomtek.trim() }).eq('id', id)
    await ubahStatus('selesai')
  }

  if (checking || !permohonan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Memuat data...</p>
      </main>
    )
  }

  const info = statusInfo[permohonan.status]

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-5">
          <Link
            href="/staf/dashboard"
            className="mb-3 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="font-mono text-xl font-semibold text-slate-900">
              {permohonan.nomor_tiket}
            </h1>
            {info && (
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${info.color}`}>
                {info.label}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto mt-6 max-w-3xl space-y-6 px-4">
        {/* Data Pemohon & Lokasi */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Data Permohonan</h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Jenis</dt>
              <dd className="text-slate-900">{jenisLabel[permohonan.jenis_rekomendasi]}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Nama Pemohon</dt>
              <dd className="text-slate-900">{permohonan.nama}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Pekerjaan</dt>
              <dd className="text-slate-900">{permohonan.pekerjaan || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">No. Telepon</dt>
              <dd className="text-slate-900">{permohonan.no_telp}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Alamat Pemohon</dt>
              <dd className="text-slate-900">
                Jl. {permohonan.alamat_jalan}, RT {permohonan.rt}/RW {permohonan.rw},{' '}
                {permohonan.kelurahan}, {permohonan.kecamatan}, {permohonan.kota}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Lokasi Permohonan</dt>
              <dd className="text-slate-900">
                Jl. {permohonan.lokasi_jalan}, sekitar {permohonan.lokasi_sekitar_irigasi}, RT{' '}
                {permohonan.lokasi_rt}/RW {permohonan.lokasi_rw}, {permohonan.lokasi_kelurahan},{' '}
                {permohonan.lokasi_kecamatan}, {permohonan.lokasi_kota}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Sertifikat/Letter C</dt>
              <dd className="text-slate-900">{permohonan.sertifikat_nomor || '-'}</dd>
            </div>
          </dl>
        </section>

        {/* Dokumen */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Berkas Persyaratan</h2>
          {dokumen.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada berkas diunggah.</p>
          ) : (
            <ul className="space-y-2">
              {dokumen.map((d) => (
                <li key={d.jenis_dokumen} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <span className="text-slate-700">{dokumenLabel[d.jenis_dokumen] ?? d.jenis_dokumen}</span>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">
                    Lihat / Unduh
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Catatan sebelumnya kalau ada */}
        {(permohonan.status === 'dokumen_tidak_lengkap' || permohonan.status === 'ditolak') && (
          <section className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">
              Status ini bersifat akhir — permohonan sudah dikembalikan ke pemohon.
            </p>
          </section>
        )}

        {/* Aksi sesuai status */}
        {permohonan.status === 'diajukan' && (
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Pengecekan Dokumen</h2>
            <button onClick={handleDokumenLengkap} disabled={processing} className={btnPrimary}>
              Dokumen Lengkap
            </button>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Alasan dokumen tidak lengkap
              </label>
              <textarea
                value={catatanTidakLengkap}
                onChange={(e) => setCatatanTidakLengkap(e.target.value)}
                rows={2}
                className={textareaClass}
                placeholder="Contoh: Foto lokasi belum menyertakan titik koordinat"
              />
              <button
                onClick={handleDokumenTidakLengkap}
                disabled={processing || !catatanTidakLengkap.trim()}
                className={`${btnDanger} mt-2`}
              >
                Dokumen Tidak Lengkap
              </button>
            </div>
          </section>
        )}

        {permohonan.status === 'dokumen_lengkap' && (
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Peninjauan Lapangan</h2>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Catatan hasil survey (opsional)
            </label>
            <textarea
              value={catatanSurvey}
              onChange={(e) => setCatatanSurvey(e.target.value)}
              rows={2}
              className={textareaClass}
            />
            <button onClick={handleSelesaiSurvey} disabled={processing} className={`${btnPrimary} mt-2`}>
              Tandai Sudah Disurvey
            </button>
          </section>
        )}

        {permohonan.status === 'survey' && (
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Keputusan</h2>
            <button onClick={handleDiterima} disabled={processing} className={btnPrimary}>
              Diterima
            </button>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">Alasan ditolak</label>
              <textarea
                value={catatanDitolak}
                onChange={(e) => setCatatanDitolak(e.target.value)}
                rows={2}
                className={textareaClass}
                placeholder="Contoh: Bukan kewenangan Pemerintah Kota"
              />
              <button
                onClick={handleDitolak}
                disabled={processing || !catatanDitolak.trim()}
                className={`${btnDanger} mt-2`}
              >
                Ditolak
              </button>
            </div>
          </section>
        )}

        {permohonan.status === 'diterima' && (
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Terbitkan Rekomendasi Teknis</h2>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nomor Surat</label>
            <input
              value={nomorRekomtek}
              onChange={(e) => setNomorRekomtek(e.target.value)}
              placeholder="600/123/DPUPR/2026"
              className={textareaClass}
            />
            <label className="mb-1 mt-3 block text-sm font-medium text-slate-700">File PDF Rekomtek</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFileRekomtek(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleUploadRekomtek}
              disabled={processing || !fileRekomtek || !nomorRekomtek.trim()}
              className={`${btnPrimary} mt-3`}
            >
              Terbitkan & Selesaikan
            </button>
          </section>
        )}

        {permohonan.status === 'selesai' && (
          <section className="rounded-lg border border-green-200 bg-green-50 p-6">
            <p className="text-sm text-green-700">
              Permohonan ini sudah selesai diproses. Nomor surat: {permohonan.nomor_surat}
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
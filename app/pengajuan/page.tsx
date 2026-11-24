'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const initialForm = {
  jenis_rekomendasi: 'garis_sempadan',
  nama: '',
  pekerjaan: '',
  alamat_jalan: '',
  rt: '',
  rw: '',
  kelurahan: '',
  kecamatan: '',
  kota: '',
  no_telp: '',
  lokasi_tanah_milik: '',
  sertifikat_nomor: '',
  lokasi_jalan: '',
  lokasi_sekitar_irigasi: '',
  lokasi_rt: '',
  lokasi_rw: '',
  lokasi_kelurahan: '',
  lokasi_kecamatan: '',
  lokasi_kota: '',
}

// Daftar dokumen yang wajib/opsional diupload, sesuai Formulir Rekomtek
const dokumenList = [
  { key: 'ktp', label: 'Foto Copy KTP', required: true },
  { key: 'sertifikat', label: 'Foto Copy Sertifikat / Letter C', required: true },
  { key: 'akta', label: 'Foto Copy Akta Perusahaan (bagi badan hukum)', required: false },
  { key: 'foto_lokasi', label: 'Foto Dokumentasi Lokasi (disertai titik koordinat)', required: true },
  { key: 'gambar_desain', label: 'Gambar Desain Rencana', required: true },
  { key: 'surat_kesanggupan', label: 'Surat Pernyataan Kesanggupan', required: true },
  { key: 'surat_tidak_keberatan', label: 'Surat Pernyataan Tidak Keberatan (khusus Pengalihan Saluran)', required: false },
] as const

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600'

const labelClass = 'mb-1 block text-sm font-medium text-slate-700'

export default function PengajuanPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [nomorTiket, setNomorTiket] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState<Record<string, File | null>>({})

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFileChange(key: string, file: File | null) {
    setFiles((prev) => ({ ...prev, [key]: file }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Simpan data form lewat fungsi database (pemohon tanpa login tidak boleh membaca tabel permohonan)
    const { data: permohonan, error: insertError } = await supabase.rpc('ajukan_permohonan', {
      data: form,
    })

    if (insertError || !permohonan) {
      setLoading(false)
      setError(insertError?.message ?? 'Gagal menyimpan permohonan')
      return
    }

    // 2. Upload tiap file yang diisi, lalu catat di dokumen_lampiran
    for (const doc of dokumenList) {
      const file = files[doc.key]
      if (!file) continue

      const path = `${permohonan.id}/${doc.key}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('dokumen-pemohon')
        .upload(path, file)

      if (uploadError) {
        setLoading(false)
        setError(`Gagal upload ${doc.label}: ${uploadError.message}`)
        return
      }

      await supabase.from('dokumen_lampiran').insert({
        permohonan_id: permohonan.id,
        jenis_dokumen: doc.key,
        file_url: path,
      })
    }

    setLoading(false)
    setNomorTiket(permohonan.nomor_tiket)
  }

  if (nomorTiket) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
            Permohonan Berhasil Dikirim
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Simpan nomor tiket berikut untuk memantau status permohonan Anda.
          </p>
          <p className="mt-4 rounded-md bg-slate-50 py-3 font-mono text-xl font-semibold tracking-wide text-blue-700">
            {nomorTiket}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-5">
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
            Permohonan Rekomendasi Teknis
          </h1>
          <p className="mt-1 text-sm text-slate-500">Bidang Sumber Daya Air</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-2xl space-y-6 px-4">
        {/* Section 1 */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              1
            </span>
            <h2 className="text-sm font-semibold text-slate-900">Jenis Rekomendasi</h2>
          </div>
          <label className={labelClass}>Pilih jenis permohonan</label>
          <select
            name="jenis_rekomendasi"
            value={form.jenis_rekomendasi}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="garis_sempadan">Rekomendasi Garis Sempadan Jaringan Irigasi</option>
            <option value="akses_jalan_masuk">Rekomendasi Sempadan Irigasi untuk Akses Jalan Masuk</option>
            <option value="pengalihan_saluran">Rekomendasi Pengalihan Saluran Irigasi</option>
          </select>
        </section>

        {/* Section 2 */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              2
            </span>
            <h2 className="text-sm font-semibold text-slate-900">Data Pemohon</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nama Lengkap</label>
              <input name="nama" value={form.nama} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Pekerjaan</label>
              <input name="pekerjaan" value={form.pekerjaan} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>No. Telepon</label>
              <input name="no_telp" value={form.no_telp} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Jalan</label>
              <input name="alamat_jalan" value={form.alamat_jalan} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>RT</label>
              <input name="rt" value={form.rt} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>RW</label>
              <input name="rw" value={form.rw} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Desa/Kelurahan</label>
              <input name="kelurahan" value={form.kelurahan} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Kecamatan</label>
              <input name="kecamatan" value={form.kecamatan} onChange={handleChange} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Kota</label>
              <input name="kota" value={form.kota} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              3
            </span>
            <h2 className="text-sm font-semibold text-slate-900">Data Lokasi Permohonan</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Lokasi di atas tanah milik</label>
              <input name="lokasi_tanah_milik" value={form.lokasi_tanah_milik} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sertifikat / Letter C Nomor</label>
              <input name="sertifikat_nomor" value={form.sertifikat_nomor} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Jalan</label>
              <input name="lokasi_jalan" value={form.lokasi_jalan} onChange={handleChange} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Terletak di sekitar jaringan irigasi</label>
              <input name="lokasi_sekitar_irigasi" value={form.lokasi_sekitar_irigasi} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>RT</label>
              <input name="lokasi_rt" value={form.lokasi_rt} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>RW</label>
              <input name="lokasi_rw" value={form.lokasi_rw} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Desa/Kelurahan</label>
              <input name="lokasi_kelurahan" value={form.lokasi_kelurahan} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Kecamatan</label>
              <input name="lokasi_kecamatan" value={form.lokasi_kecamatan} onChange={handleChange} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Kota</label>
              <input name="lokasi_kota" value={form.lokasi_kota} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </section>

        {/* Section 4: Upload dokumen */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              4
            </span>
            <h2 className="text-sm font-semibold text-slate-900">Berkas Persyaratan</h2>
          </div>
          <div className="space-y-4">
            {dokumenList.map((doc) => (
              <div key={doc.key}>
                <label className={labelClass}>
                  {doc.label}
                  {doc.required && <span className="ml-1 text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required={doc.required}
                  onChange={(e) => handleFileChange(doc.key, e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            ))}
          </div>
        </section>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Mengirim Permohonan...' : 'Kirim Permohonan'}
        </button>
      </form>
    </main>
  )
}
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Top accent bar */}
      <div className="h-1.5 bg-blue-800" />

      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-5">
          <Image
            src="/logo-pemkot.png"
            alt="Logo Pemerintah Kota Tasikmalaya"
            width={52}
            height={52}
            className="shrink-0"
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Pemerintah Kota Tasikmalaya
            </p>
            <p className="text-sm font-semibold text-slate-900">
              Dinas Pekerjaan Umum dan Tata Ruang
            </p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path
            d="M0 260 C 150 220, 250 300, 400 260 S 650 220, 800 260 L 800 400 L 0 400 Z"
            fill="#1e40af"
          />
          <path
            d="M0 300 C 150 270, 250 330, 400 300 S 650 270, 800 300 L 800 400 L 0 400 Z"
            fill="#1e40af"
          />
        </svg>

        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Layanan Bidang Sumber Daya Air
          </p>
          <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
            Permohonan Rekomendasi Teknis, Tanpa Perlu Datang ke Kantor
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
            Ajukan permohonan rekomendasi teknis jaringan irigasi secara daring.
            Pantau prosesnya kapan saja, dari mana saja.
          </p>
        </div>
      </section>

      {/* CTA cards */}
      <section className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Link
            href="/pengajuan"
            className="group rounded-xl border border-slate-200 bg-white p-7 transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Ajukan Permohonan Baru
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Isi formulir dan unggah berkas persyaratan. Prosesnya sekitar 10 menit.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700">
              Mulai pengajuan
              <svg className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>

          <Link
            href="/cek-status"
            className="group rounded-xl border border-slate-200 bg-white p-7 transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Cek Status Permohonan
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Pantau progres permohonan menggunakan nomor tiket yang sudah didapat.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700">
              Cek sekarang
              <svg className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Jenis layanan */}
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold text-slate-900">Jenis Rekomendasi Teknis yang Dilayani</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
            <li>· Rekomendasi Garis Sempadan Jaringan Irigasi</li>
            <li>· Rekomendasi Sempadan Irigasi untuk Akses Jalan Masuk</li>
            <li>· Rekomendasi Pengalihan Saluran Irigasi</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-400 sm:flex-row">
          <span>© 2026 Dinas Pekerjaan Umum dan Tata Ruang, Kota Tasikmalaya</span>
          <Link href="/staf/login" className="hover:text-slate-600">
            Login Staf
          </Link>
        </div>
      </footer>
    </main>
  )
}
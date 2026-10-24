import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import QRCode from 'qrcode'
import { Check, Download, LockKeyhole, QrCode, RotateCcw } from 'lucide-react'
import './index.css'

function App() {
  const [link, setLink] = useState('https://qora.pahang.dev')
  const [foreground, setForeground] = useState('#18181b')
  const [background, setBackground] = useState('#ffffff')
  const [margin, setMargin] = useState(2)
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [svg, setSvg] = useState('')
  const [copied, setCopied] = useState(false)
  const svgRef = useRef<HTMLDivElement>(null)
  const content = link.trim() || 'https://qora.pahang.dev'

  useEffect(() => {
    QRCode.toString(content, { type: 'svg', errorCorrectionLevel: errorLevel, margin, color: { dark: foreground, light: background } }).then(setSvg)
  }, [content, foreground, background, margin, errorLevel])

  const download = async (format: 'svg' | 'png') => {
    const data = format === 'svg' ? svg : await QRCode.toDataURL(content, { width: 1600, errorCorrectionLevel: errorLevel, margin, color: { dark: foreground, light: background } })
    const url = format === 'svg' ? URL.createObjectURL(new Blob([data], { type: 'image/svg+xml' })) : data
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `qora-link.${format}`
    anchor.click()
    if (format === 'svg') URL.revokeObjectURL(url)
  }

  const resetStyle = () => { setForeground('#18181b'); setBackground('#ffffff'); setMargin(2); setErrorLevel('M') }

  return <main className="min-h-screen bg-[#f7f7f2] text-zinc-900"><div className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-9">
    <header className="flex items-center justify-between"><a className="flex items-center gap-2 text-xl font-black tracking-tight" href="/"><span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white"><QrCode size={20}/></span>qora</a><span className="hidden items-center gap-2 text-sm text-zinc-500 sm:flex"><LockKeyhole size={15}/> 100% dalam pelayar</span></header>
    <section className="mb-8 mt-14 max-w-2xl"><p className="mb-3 text-sm font-bold uppercase tracking-[.18em] text-emerald-700">Penjana QR pautan percuma</p><h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">QR pautan, terus siap.</h1><p className="mt-4 text-lg leading-relaxed text-zinc-600">Cipta, ubah suai dan muat turun kod QR untuk pautan anda tanpa akaun. Data anda tidak pernah meninggalkan peranti ini.</p></section>
    <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start"><section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 sm:p-7">
      <h2 className="text-lg font-bold">1. Masukkan pautan</h2><div className="mt-4 grid gap-2"><label className="text-sm font-medium" htmlFor="url">URL laman web</label><input id="url" type="url" value={link} onChange={event => setLink(event.target.value)} placeholder="https://contoh.my" className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></div>
      <div className="mt-8 border-t border-zinc-100 pt-6"><div className="flex items-center justify-between"><h2 className="font-bold">2. Gaya</h2><button onClick={resetStyle} className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900"><RotateCcw size={14}/> Reset</button></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Warna kod <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-zinc-200 px-3"><input aria-label="Warna kod" type="color" value={foreground} onChange={event => setForeground(event.target.value)} className="h-7 w-7 cursor-pointer border-0 bg-transparent p-0"/><code className="text-zinc-500">{foreground}</code></span></label><label className="text-sm font-medium">Latar belakang <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-zinc-200 px-3"><input aria-label="Latar belakang" type="color" value={background} onChange={event => setBackground(event.target.value)} className="h-7 w-7 cursor-pointer border-0 bg-transparent p-0"/><code className="text-zinc-500">{background}</code></span></label><label className="text-sm font-medium">Ruang tepi<select value={margin} onChange={event => setMargin(Number(event.target.value))} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3"><option value="0">Tiada</option><option value="2">Sederhana</option><option value="4">Luas</option></select></label><label className="text-sm font-medium">Pembetulan ralat<select value={errorLevel} onChange={event => setErrorLevel(event.target.value as typeof errorLevel)} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3"><option value="L">Rendah</option><option value="M">Sederhana</option><option value="Q">Tinggi</option><option value="H">Sangat tinggi</option></select></label></div></div>
    </section><aside className="sticky top-6 rounded-3xl bg-zinc-900 p-6 text-white shadow-xl sm:p-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-emerald-400">Live preview</p><div ref={svgRef} className="mt-5 grid aspect-square place-items-center overflow-hidden rounded-2xl bg-white p-5" dangerouslySetInnerHTML={{ __html: svg }} /><p className="mt-5 break-all rounded-xl bg-white/10 px-3 py-2 font-mono text-xs text-zinc-300">{content}</p><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={() => download('png')} className="btn bg-emerald-400 text-zinc-950 hover:bg-emerald-300"><Download size={17}/> PNG</button><button onClick={() => download('svg')} className="btn bg-white text-zinc-950 hover:bg-zinc-200"><Download size={17}/> SVG</button></div><button onClick={async () => { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="mt-3 flex w-full items-center justify-center gap-2 text-sm text-zinc-300 hover:text-white">{copied ? <><Check size={15}/> Disalin</> : 'Salin pautan'}</button></aside></div>
    <footer className="py-12 text-center text-sm text-zinc-500">Qora menjana QR pautan secara setempat — tiada penjejakan, tiada akaun.</footer>
  </div></main>
}

createRoot(document.getElementById('root')!).render(<App />)

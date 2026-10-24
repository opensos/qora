import { useEffect, useState } from 'react'
import { Check, Copy, Download, Link2, QrCode } from 'lucide-react'
import { createRoot } from 'react-dom/client'
import QRCode from 'qrcode'
import './index.css'

type Mode = 'qr' | 'shorten'

function App() {
  const [mode, setMode] = useState<Mode>('qr')
  const [url, setUrl] = useState('')
  const [svg, setSvg] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (mode !== 'qr' || !url.trim()) { setSvg(''); return }
    QRCode.toString(url.trim(), { type: 'svg', errorCorrectionLevel: 'M', margin: 2, color: { dark: '#111111', light: '#ffffff' } }).then(setSvg)
  }, [mode, url])

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const download = async (format: 'svg' | 'png') => {
    if (!url.trim()) return
    const value = url.trim()
    const data = format === 'svg' ? svg : await QRCode.toDataURL(value, { width: 1600, errorCorrectionLevel: 'M', margin: 2 })
    const href = format === 'svg' ? URL.createObjectURL(new Blob([data], { type: 'image/svg+xml' })) : data
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `qora-qr.${format}`
    anchor.click()
    if (format === 'svg') URL.revokeObjectURL(href)
  }

  const shorten = async () => {
    setError('')
    setShortUrl('')
    setWorking(true)
    try {
      const response = await fetch('/api/shorten', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
      const data = await response.json() as { shortUrl?: string; error?: string }
      if (!response.ok || !data.shortUrl) throw new Error(data.error || 'Tidak dapat memendekkan pautan.')
      setShortUrl(data.shortUrl)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Tidak dapat memendekkan pautan.') } finally { setWorking(false) }
  }

  const selectMode = (next: Mode) => { setMode(next); setError(''); setShortUrl('') }
  const label = mode === 'qr' ? 'tampal pautan untuk jana QR' : 'tampal pautan untuk pendekkan'

  const compact = mode === 'qr' && Boolean(svg)
  return <main className="h-dvh overflow-hidden bg-white text-zinc-950"><header className="border-b border-zinc-100"><div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5"><a href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight"><span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-950 text-white"><QrCode size={16}/></span>qora</a><span className="text-xs text-zinc-400">privacy-first</span></div></header>
    <section className={`mx-auto flex h-[calc(100dvh-57px)] max-w-5xl flex-col items-center justify-center px-5 text-center ${compact ? 'py-3 sm:py-5' : 'py-8 sm:py-12'}`}>
      <div className={`grid place-items-center rounded-[2rem] border border-zinc-200 text-zinc-950 ${compact ? 'h-12 w-12 rounded-2xl sm:h-16 sm:w-16' : 'h-20 w-20 sm:h-24 sm:w-24'}`}><QrCode size={compact ? 28 : 48} strokeWidth={1.4}/></div>
      <h1 className={`font-semibold tracking-[-.05em] ${compact ? 'mt-3 text-2xl sm:mt-5 sm:text-4xl' : 'mt-7 text-3xl sm:text-5xl'}`}>Pautan, dipermudah.</h1>
      <p className={`max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base ${compact ? 'mt-1 sm:mt-2' : 'mt-3'}`}>Jana QR secara terus atau pendekkan pautan anda. Tanpa akaun, tanpa penjejakan.</p>
      <div className={`flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 text-sm font-medium ${compact ? 'mt-3 sm:mt-4' : 'mt-8'}`}><button onClick={() => selectMode('qr')} className={`rounded-lg px-4 py-2 transition ${mode === 'qr' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-950'}`}>Jana QR</button><button onClick={() => selectMode('shorten')} className={`rounded-lg px-4 py-2 transition ${mode === 'shorten' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-950'}`}>Pendekkan</button></div>
      <div className={`flex w-full max-w-xl flex-col gap-2 sm:flex-row ${compact ? 'mt-3 sm:mt-4' : 'mt-5'}`}><label className="sr-only" htmlFor="url">Pautan</label><div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 shadow-sm transition focus-within:border-zinc-950 focus-within:ring-4 focus-within:ring-zinc-100"><Link2 size={18} className="shrink-0 text-zinc-400"/><input id="url" type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder={label} className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400 sm:h-14" /></div>{mode === 'shorten' && <button onClick={shorten} disabled={working || !url.trim()} className="h-12 rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 sm:h-14">{working ? 'Memproses…' : 'Pendekkan'}</button>}</div>
      {mode === 'qr' && svg && <div className="mt-4 w-full max-w-xl sm:mt-5"><div className="mx-auto grid w-44 place-items-center rounded-2xl border border-zinc-200 bg-white p-3 sm:w-56 sm:p-4" dangerouslySetInnerHTML={{ __html: svg }} /><div className="mt-2 flex justify-center gap-2 sm:mt-3"><button onClick={() => download('png')} className="action"><Download size={15}/> PNG</button><button onClick={() => download('svg')} className="action"><Download size={15}/> SVG</button><button onClick={() => copy(url.trim())} className="action">{copied ? <><Check size={15}/> disalin</> : <><Copy size={15}/> salin</>}</button></div><p className="mt-2 line-clamp-1 break-all font-mono text-xs text-zinc-400">{url.trim()}</p></div>}
      {mode === 'shorten' && <div className="mt-6 w-full max-w-xl">{shortUrl && <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-left"><Link2 size={18} className="shrink-0 text-zinc-400"/><p className="min-w-0 flex-1 break-all font-mono text-sm">{shortUrl}</p><button onClick={() => copy(shortUrl)} className="action shrink-0">{copied ? <Check size={15}/> : <Copy size={15}/>}</button></div>}{error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}<p className="mt-5 text-xs text-zinc-400">QR anda kekal terus ke URL asal. Pemendek pautan ialah servis berasingan.</p></div>}
    </section>
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)

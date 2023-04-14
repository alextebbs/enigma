export default function PanelHeader({ title }) {
  return (
    <div className='absolute w-full border-b border-slate-900 p-2 text-xs uppercase tracking-[0.2em] text-slate-600'>
      {title}
    </div>
  )
}

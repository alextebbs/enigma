interface PanelHeaderProps {
  title: string
}

export const PanelHeader: React.FC<PanelHeaderProps> = (props) => {
  const { title } = props

  return (
    <div className='w-full border-b border-slate-900 p-2 text-xs uppercase tracking-[0.2em] text-slate-600'>
      {title}
    </div>
  )
}

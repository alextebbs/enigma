import { useState } from 'react'
import { BsInfoCircle, BsQuestionCircle, BsXCircle } from 'react-icons/bs'

interface PanelHeaderProps {
  title: string
  toolTipIsActive?: boolean
  toolTipPosition?: 'inside' | 'outside'
  tutorialModeIsActive?: boolean
  onInfoClick?: () => void
  children?: React.ReactNode
}

export const PanelHeader: React.FC<PanelHeaderProps> = (props) => {
  const {
    title,
    onInfoClick,
    toolTipIsActive = false,
    tutorialModeIsActive = false,
    toolTipPosition = 'outside',
    children,
  } = props

  return (
    <div className='relative z-[80]'>
      <div className='flex w-full items-center rounded-b-md border-t border-slate-900 bg-black text-xs uppercase tracking-[0.2em] text-slate-600'>
        {!tutorialModeIsActive && (
          <button
            className={`flex items-center border-r border-slate-900 p-2 px-4 hover:border-blue-500 hover:bg-blue-500 hover:text-white ${
              toolTipIsActive
                ? `rounded-none border-blue-500 bg-blue-500 text-white`
                : `rounded-bl-md`
            }`}
            onClick={onInfoClick}>
            {toolTipIsActive ? (
              <>
                <BsXCircle className='mr-2' />
                Hide info
              </>
            ) : (
              <>
                <BsInfoCircle className='mr-2' />
                Show info
              </>
            )}
          </button>
        )}

        <div className='ml-auto p-2 px-4'>{title}</div>
      </div>

      {toolTipIsActive && (
        <div
          className={`absolute inset-x-0 bottom-8 overflow-auto border-slate-800 bg-black/90 p-4 text-xs text-slate-200 max-md:h-[180px] max-md:border-t md:left-auto md:top-auto md:h-auto md:w-[400px] md:border-blue-500 ${
            toolTipPosition == 'outside'
              ? `md:bottom-[-1px] md:left-auto md:right-[calc(100%+1px)] md:rounded-l-md md:border-y md:border-l md:bg-slate-950`
              : `bg-[rgba(0,0,0,0.6)] md:bottom-[calc(100%+1rem)] md:left-4 md:right-auto md:rounded-md md:shadow-[0_0_60px_10px_rgba(0,0,0,0.9)]`
          }`}>
          {children}
        </div>
      )}
    </div>
  )
}

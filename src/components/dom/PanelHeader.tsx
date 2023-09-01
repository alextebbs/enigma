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
          className={`absolute w-[400px] border-blue-500 p-4 text-xs text-slate-200 ${
            toolTipPosition == 'outside'
              ? `right-[calc(100%+1px)] top-[calc(100%+1px)] -translate-y-full rounded-l-md border-y border-l bg-slate-950`
              : `bottom-[calc(100%+1rem)] left-[1rem] rounded-md bg-[rgba(0,0,0,0.6)] shadow-[0_0_60px_10px_rgba(0,0,0,0.9)]`
          }`}>
          {children}
        </div>
      )}
    </div>
  )
}

import { Plugboard } from '@/components/dom/Plugboard'
import { IO } from '@/components/dom/IO'
import { ChangeEvent, useState } from 'react'
import { initialRotors, initialReflector } from '@/_globals'
import { RotorsScene } from '@/components/canvas/RotorScene'
import { PanelHeader } from '@/components/dom/PanelHeader'
import { Machine, MachineState } from '@/components/machine/Machine'

export default function Page() {
  const [machineState, setMachineState] = useState<MachineState>({
    plugboard: {},
    rotors: initialRotors,
    reflector: initialReflector,
  })

  // const [settings, setSettings] = useState({
  //   showRotors: false,
  //   allowLowercase: true,
  //   plugboardHidden: false,
  //   rotorSettingsHidden: true,
  //   plugboardSettingsHidden: true,
  //   IOSettingsHidden: true,
  // })

  const [transformationLog, setTransformationLog] = useState(undefined)
  const [plainText, setPlainText] = useState('')
  const [cipherText, setCipherText] = useState('')

  const onTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let machine = new Machine({
      plugboard: machineState.plugboard,
      rotors: initialRotors,
      reflector: initialReflector,
    })

    setCipherText(machine.encodeString(e.target.value))
    setPlainText(e.target.value)
    setMachineState(machine.exportMachineState())
    setTransformationLog(machine.exportTransformationLog())
  }

  return (
    <div className='flex h-[100vh] gap-8 p-8'>
      <div className='h-full grow border border-slate-800 bg-black'>
        <PanelHeader title='Rotors' />
        <RotorsScene {...{ machineState, transformationLog }} />
      </div>
      <div className='flex flex-col gap-8'>
        <div className='relative z-10 flex grow flex-col border border-slate-800 bg-black'>
          <PanelHeader title='Input / Output' />
          <IO {...{ onTextAreaChange, plainText, cipherText }} />

          {transformationLog?.plugboard.forwards.enter && (
            <>
              <div className='absolute left-[25%] top-[100%] h-8 w-[2px] bg-yellow-500'>
                <div className='absolute left-[50%] top-0 h-1.5 w-1.5 translate-x-[-50%] translate-y-[-50%] rounded-full bg-yellow-500' />
                <div className='absolute left-[50%] top-[100%] h-2 w-2 translate-x-[-50%] translate-y-[calc(-50%-0.2rem)] rotate-45 border-2 border-l-0 border-t-0 border-yellow-500' />
                <div className='absolute left-[100%] top-[50%] translate-x-2 translate-y-[-50%] text-xs text-yellow-500'>
                  {transformationLog.plugboard.forwards.enter}
                </div>
              </div>

              <div className='absolute left-[75%] top-[100%] h-8 w-[2px] bg-pink-500'>
                <div className='absolute left-[50%] top-[100%] h-1.5 w-1.5 translate-x-[-50%] translate-y-[-50%] rounded-full bg-pink-500' />
                <div className='absolute left-[50%] top-0 h-2 w-2 translate-x-[-50%] translate-y-[calc(-50%+0.2rem)] rotate-[225deg] border-2 border-l-0 border-t-0 border-pink-500' />
                <div className='absolute left-[100%] top-[50%] translate-x-2 translate-y-[-50%] text-xs text-pink-500'>
                  {transformationLog.plugboard.backwards.exit}
                </div>
              </div>
            </>
          )}
        </div>
        <div className='relative border border-slate-800 bg-black'>
          <PanelHeader title='Plugboard' />

          <Plugboard
            {...{ machineState, transformationLog, setMachineState }}
          />

          {transformationLog?.plugboard.backwards.enter && (
            <>
              <div className='absolute right-[100%] top-[25%] h-[2px] w-8 bg-yellow-500'>
                <div className='absolute left-[100%] top-[50%] h-1.5 w-1.5 translate-x-[-50%] translate-y-[-50%] rounded-full bg-yellow-500' />
                <div className='absolute left-0 top-[50%] h-2 w-2 translate-x-[calc(-50%+0.2rem)] translate-y-[calc(-50%)] rotate-[135deg] border-2 border-l-0 border-t-0 border-yellow-500' />
                <div className='absolute bottom-[100%] left-[50%] translate-x-[-50%] translate-y-[-0.25rem] text-xs text-yellow-500'>
                  {transformationLog.plugboard.forwards.exit}
                </div>
              </div>

              <div className='absolute right-[100%] top-[75%] h-[2px] w-8 bg-pink-500'>
                <div className='absolute left-0 top-[50%] h-1.5 w-1.5 translate-x-[-50%] translate-y-[-50%] rounded-full bg-pink-500' />
                <div className='absolute left-[100%] top-[50%] h-2 w-2 translate-x-[calc(-50%-0.2rem)] translate-y-[calc(-50%)] rotate-[-45deg] border-2 border-l-0 border-t-0 border-pink-500' />
                <div className='absolute bottom-[100%] left-[50%] translate-x-[-50%] translate-y-[-0.25rem] text-xs text-pink-500'>
                  {transformationLog.plugboard.backwards.enter}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

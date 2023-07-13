import { Plugboard } from '@/components/dom/Plugboard'
import { IO } from '@/components/dom/IO'
import { ChangeEvent, useState } from 'react'
import { initialRotors, initialReflector } from '@/_globals'
import { RotorsScene } from '@/components/canvas/RotorScene'
import { PanelHeader } from '@/components/dom/PanelHeader'
import { Machine, MachineState, Log } from '@/components/machine/Machine'

export default function Page() {
  const [machineState, setMachineState] = useState<MachineState>({
    plugboard: {},
    rotors: initialRotors,
    reflector: initialReflector,
  })

  const [transformationLog, setTransformationLog] = useState<Log | null>(null)
  const [plainText, setPlainText] = useState<string>('')
  const [cipherText, setCipherText] = useState<string>('')

  const clearMachine = () => {
    setPlainText('')
    setCipherText('')
    setTransformationLog(null)
  }

  const onTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const machine = new Machine({
      plugboard: machineState.plugboard,
      rotors: machineState.rotors.map((rotor) => {
        return {
          ...rotor,
          position: 0,
          visualPosition: 0,
        }
      }),
      reflector: machineState.reflector,
    })

    setPlainText(e.target.value)
    setCipherText(machine.encodeString(e.target.value))
    setMachineState(machine.exportMachineState())
    setTransformationLog(machine.exportTransformationLog())
  }

  return (
    <div className='flex h-[100vh] flex-col md:flex-row md:gap-8 md:p-8'>
      <div className='relative h-[70vh] border border-slate-800 bg-black md:h-full md:w-[calc(100vw-6rem-372px)] xl:w-[calc(100vw-6rem-520px)]'>
        <PanelHeader title='Rotors' />
        <RotorsScene
          {...{
            machineState,
            transformationLog,
            setMachineState,
            clearMachine,
          }}
        />
        <div className='absolute bottom-6 left-6 z-10 text-xs uppercase tracking-[0.15em] text-gray-500'>
          <div className='mb-4 flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-yellow-500' />
            Input
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-pink-500' />
            Output
          </div>
        </div>
      </div>
      <div className='flex flex-col md:w-[372px] md:gap-8 xl:w-[520px]'>
        <div className='relative z-10 flex h-[30vh] grow flex-col border border-slate-800 bg-black md:h-auto'>
          <PanelHeader title='Input / Output' />
          <IO {...{ onTextAreaChange, plainText, cipherText }} />

          {transformationLog?.plugboard.forwards.enter && (
            <>
              <div className='absolute left-[25%] top-[100%] hidden h-8 w-[2px] bg-yellow-500 md:block'>
                <div className='absolute left-[50%] top-0 h-1.5 w-1.5 translate-x-[-50%] translate-y-[-50%] rounded-full bg-yellow-500' />
                <div className='absolute left-[50%] top-[100%] h-2 w-2 translate-x-[-50%] translate-y-[calc(-50%-0.2rem)] rotate-45 border-2 border-l-0 border-t-0 border-yellow-500' />
                <div className='absolute left-[100%] top-[50%] translate-x-2 translate-y-[-50%] text-xs text-yellow-500'>
                  {transformationLog.plugboard.forwards.enter}
                </div>
              </div>

              <div className='absolute left-[75%] top-[100%] hidden h-8 w-[2px] bg-pink-500 md:block'>
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
              <div className='absolute right-[100%] top-[25%] hidden h-[2px] w-8 bg-yellow-500 md:block'>
                <div className='absolute left-[100%] top-[50%] h-1.5 w-1.5 translate-x-[-50%] translate-y-[-50%] rounded-full bg-yellow-500' />
                <div className='absolute left-0 top-[50%] h-2 w-2 translate-x-[calc(-50%+0.2rem)] translate-y-[calc(-50%)] rotate-[135deg] border-2 border-l-0 border-t-0 border-yellow-500' />
                <div className='absolute bottom-[100%] left-[50%] translate-x-[-50%] translate-y-[-0.25rem] text-xs text-yellow-500'>
                  {transformationLog.plugboard.forwards.exit}
                </div>
              </div>

              <div className='absolute right-[100%] top-[75%] hidden h-[2px] w-8 bg-pink-500 md:block'>
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

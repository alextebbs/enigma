import Plugboard from '@/components/dom/Plugboard'
import IO from '@/components/dom/IO'
import { ChangeEvent, useState } from 'react'
import { initialRotors, initialReflector } from '@/_globals'
import RotorsScene from '@/components/canvas/RotorScene'
import PanelHeader from '@/components/dom/PanelHeader'
import Machine from '@/components/machine/Machine'

export default function Page() {
  const [machineState, setMachineState] = useState<MachineState>({
    plugboard: {},
    rotors: initialRotors,
    reflector: initialReflector,
  })

  const [transformationLog, setTransformationLog] = useState()
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
    <div className='grid grid-cols-3'>
      <div className='col-span-2 border-r border-slate-900'>
        <div className='relative h-[100vh]'>
          <PanelHeader title='Rotors' />
          <RotorsScene
            {...{
              machineState,
              transformationLog,
            }}
          />
        </div>
      </div>
      <div className='col-span-1'>
        <div className='flex h-[100vh] flex-col'>
          <div className='flex-1'>
            <PanelHeader title='Input / Output' />
            <IO
              {...{
                onTextAreaChange,
                plainText,
                cipherText,
              }}
            />
          </div>
          <div className='relative'>
            <PanelHeader title='Plugboard' />
            <Plugboard
              {...{ machineState, transformationLog, setMachineState }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

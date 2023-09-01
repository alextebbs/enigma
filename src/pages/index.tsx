import { Plugboard } from '@/components/dom/Plugboard'
import { IO } from '@/components/dom/IO'
import { ChangeEvent, useRef, useState } from 'react'
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

  const [showingRotorsInfo, setShowingRotorsInfo] = useState<boolean>(false)
  const [showingPlugboardInfo, setShowingPlugboardInfo] =
    useState<boolean>(false)
  const [showingIOInfo, setShowingIOInfo] = useState<boolean>(false)

  const [tutorialModeIsActive, setTutorialModeIsActive] =
    useState<boolean>(true)

  const [showingTutorialModal, setShowingTutorialModal] =
    useState<boolean>(true)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      {tutorialModeIsActive && showingTutorialModal && (
        <div className='fixed inset-0 z-[90] flex flex-col items-center justify-center bg-slate-950/60'>
          <div className='w-[280px] rounded-md border border-blue-500 bg-black p-6 text-center text-xs text-white'>
            <p className='mb-6'>
              This is an interactive 3D{' '}
              <a
                target='_blank'
                className='underline'
                href='https://en.wikipedia.org/wiki/Enigma_machine'>
                Enigma machine
              </a>{' '}
              emulator. Want a quick tutorial?
            </p>
            <div className='flex items-center justify-center gap-4 text-center'>
              <button
                className='flex overflow-hidden rounded-sm bg-blue-500 p-2 px-4 text-center text-xs uppercase tracking-[0.15em] text-white transition-all hover:bg-blue-700'
                onClick={() => {
                  setShowingRotorsInfo(true)
                  setShowingTutorialModal(false)
                  textareaRef.current?.focus()
                }}>
                Yes
              </button>
              <button
                className='flex overflow-hidden rounded-sm bg-slate-500 p-2 px-4 text-center text-xs uppercase tracking-[0.15em] text-white transition-all hover:bg-slate-700'
                onClick={() => {
                  setTutorialModeIsActive(false)
                  textareaRef.current?.focus()
                }}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`relative h-[70vh] rounded-md border bg-black md:h-full md:w-[calc(100vw-6rem-372px)] xl:w-[calc(100vw-6rem-520px)] ${
          showingRotorsInfo ? `border-blue-500` : `border-slate-800`
        }`}>
        <RotorsScene
          {...{
            machineState,
            transformationLog,
            setMachineState,
            clearMachine,
          }}
        />
        <div className='absolute left-6 top-6 z-10 text-xs uppercase tracking-[0.15em] text-gray-500'>
          <div className='mb-4 flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-yellow-500' />
            Input
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-pink-500' />
            Output
          </div>
        </div>

        <div className='absolute inset-x-0 bottom-0'>
          <PanelHeader
            title='Rotors'
            toolTipIsActive={showingRotorsInfo}
            toolTipPosition='inside'
            tutorialModeIsActive={tutorialModeIsActive}
            onInfoClick={() => {
              setShowingIOInfo(false)
              setShowingPlugboardInfo(false)
              setShowingRotorsInfo(!showingRotorsInfo)
            }}>
            <div>
              <p className='mb-3'>
                You&apos;re looking at a 3D visualization of the Enigma machine
                rotors, the heart of the machine.
              </p>
              <p className='mb-3'>
                When a key is pressed, an electrical signal is sent through the
                rotor mechanism, transforming into a different letter as it
                passes through the complex and twisted internal wiring structure
                of each rotor.
              </p>
              <p className='mb-3'>
                Each keypress also turns the rotors, and thus changes the entire
                structure of the substitution.
              </p>
              <p className='mb-3'>
                The signal passes through all three rotors, and then is
                reflected and sent back through the rotor wiring again, in
                reverse. Incoming signals are visualized in{' '}
                <span className='text-yellow-500'>yellow</span> and outgoing
                signals are <span className='text-pink-500'>pink</span>.
              </p>
              <p className=''>
                You can drag the rotors to set their starting positions. This
                will change the nature of the ciphertext.
              </p>
              {tutorialModeIsActive && (
                <div className='mt-6'>
                  <button
                    className='flex overflow-hidden rounded-sm bg-blue-500 p-2 px-4 text-center text-xs uppercase tracking-[0.15em] text-white transition-all hover:bg-blue-700'
                    onClick={() => {
                      setShowingRotorsInfo(false)
                      setShowingPlugboardInfo(true)
                    }}>
                    Next
                  </button>
                </div>
              )}
            </div>
          </PanelHeader>
        </div>
      </div>
      <div className='flex flex-col md:w-[372px] md:gap-8 xl:w-[520px]'>
        <div
          className={`relative z-10 flex h-[30vh] grow flex-col rounded-md border bg-black md:h-auto ${
            showingIOInfo
              ? `rounded-bl-none border-blue-500`
              : `border-slate-800`
          }`}>
          <IO {...{ onTextAreaChange, plainText, cipherText, textareaRef }} />

          <PanelHeader
            title='Input / Output'
            toolTipIsActive={showingIOInfo}
            tutorialModeIsActive={tutorialModeIsActive}
            onInfoClick={() => {
              setShowingIOInfo(!showingIOInfo)
              setShowingPlugboardInfo(false)
              setShowingRotorsInfo(false)
            }}>
            <div>
              <p className='mb-3'>
                Type a message in this box to see the corresponding ciphertext
                and inspect the signal transformation through the plugboard and
                rotors.
              </p>
              <p className='mb-3'>
                During actual use, messages were typed into the machine one
                letter at a time. Pressing a letter would activate a light next
                to the corresponding enciphered letter on a component called the
                &ldquo;lampboard&rdquo;.
              </p>
              <p className='mb-3'>
                From there, the ciphertext would be translated to Morse code and
                sent via radio to a recipient.
              </p>
              <p className='mb-3'>
                The encryption process is bi-drectional &mdash; meaning that if
                two machines have the same rotor starting positions and
                plugboard settings, ciphertext from one machine can be input
                into the other machine to reveal the plaintext of the original
                message.
              </p>
              <p className=''>
                You can test this by copying your ciphertext and pasting it back
                into the machine.
              </p>
              {tutorialModeIsActive && (
                <div className='mt-6'>
                  <button
                    className='flex overflow-hidden rounded-sm bg-blue-500 p-2 px-4 text-center text-xs uppercase tracking-[0.15em] text-white transition-all hover:bg-blue-700'
                    onClick={() => {
                      setShowingIOInfo(false)
                      setTutorialModeIsActive(false)
                    }}>
                    Done
                  </button>
                </div>
              )}
            </div>
          </PanelHeader>

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
        <div
          className={`relative rounded-md border bg-black
            ${
              showingPlugboardInfo
                ? `rounded-bl-none border-blue-500`
                : `border-slate-800`
            }
        `}>
          <Plugboard
            {...{ machineState, transformationLog, setMachineState }}
          />

          <PanelHeader
            title='Plugboard'
            toolTipIsActive={showingPlugboardInfo}
            tutorialModeIsActive={tutorialModeIsActive}
            onInfoClick={() => {
              setShowingIOInfo(false)
              setShowingPlugboardInfo(!showingPlugboardInfo)
              setShowingRotorsInfo(false)
            }}>
            <div>
              <p className='mb-3'>
                The plugboard is an additional layer of configuration which adds
                complexity to the cipher. There are 150 trillion possible
                combinations of letters that can be made on the plugboard.
              </p>
              <p className=''>
                Click letters on the plugboard to connect them to each other.
                Connected letters are substituted for one another when the
                signal passes through the plugboard, once before the signal is{' '}
                <span className='text-yellow-500'>input</span> into the rotors,
                and once after the signal is reflected and{' '}
                <span className='text-pink-500'>output</span> from the rotors.
              </p>

              {tutorialModeIsActive && (
                <div className='mt-6'>
                  <button
                    className='flex overflow-hidden rounded-sm bg-blue-500 p-2 px-4 text-center text-xs uppercase tracking-[0.15em] text-white transition-all hover:bg-blue-700'
                    onClick={() => {
                      setShowingPlugboardInfo(false)
                      setShowingIOInfo(true)
                    }}>
                    Next
                  </button>
                </div>
              )}
            </div>
          </PanelHeader>

          {transformationLog?.plugboard.backwards.enter &&
            !showingPlugboardInfo && (
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

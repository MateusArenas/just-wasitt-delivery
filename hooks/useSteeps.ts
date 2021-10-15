interface SteepData {
  info: string
  check: boolean
}
interface useSteepsProps {
  steeps: Array<SteepData>
  finalSteepInfo: string
}
function useSteeps (props: useSteepsProps) : SteepData {

  const finalSteep: SteepData = props.steeps.length ? props.steeps?.reduce((en,val) => 
    ({ info: props.finalSteepInfo, check: en.check && val.check })
  ) : ({ info: props.finalSteepInfo, check: true })

  const steeps = [...props.steeps, finalSteep]

  const lastIndex = steeps.length - 1
  const steep = steeps.find((_step, index) => lastIndex !== index ? _step?.check === false : true)

  return steep 
}

export default useSteeps;
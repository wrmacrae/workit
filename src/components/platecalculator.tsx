import { Devvit, SetStateAction, StateSetter } from '@devvit/public-api';
import { WorkoutData } from '../types.js';

interface PlateCalculatorProps {
    plateCalculatorIndices: number[]
    setPlateCalculatorIndices: StateSetter<number[]>
    workout: WorkoutData
    setWorkout: (value: SetStateAction<WorkoutData>) => void
    setPendingUpdates: StateSetter<never[]>
    barbellWeight: number
}

const AVAILABLE_PLATES = [45, 35, 25, 10, 5, 2.5]

function getTotalWeight(props: PlateCalculatorProps): number {
    return props.workout.exercises[props.plateCalculatorIndices[0]].sets[props.plateCalculatorIndices[1]].weight ?? 45
}

function getPlatesString(weight: number, props: PlateCalculatorProps): string {
    var remainingWeight = (weight - props.barbellWeight) / 2
    if (remainingWeight <= 0) {
        return "None"
    }
    var platesUsed: number[] = []
    while (remainingWeight >= AVAILABLE_PLATES.slice(-1)[0]) {
        const nextPlate: number = AVAILABLE_PLATES.find((availablePlate: number) => remainingWeight >= availablePlate) ?? 45
        platesUsed.push(nextPlate)
        remainingWeight -= nextPlate
    }
    if (remainingWeight > 0) {
        platesUsed.push(remainingWeight)
    }
    return platesUsed.join(", ")
}

function warmupStrings(props: PlateCalculatorProps): string[] {
    const warmups = []
    const total = getTotalWeight(props)
    const initial = props.workout.exercises[props.plateCalculatorIndices[0]].name == "Deadlift" ? props.barbellWeight + AVAILABLE_PLATES[0]*2 :
                    props.workout.exercises[props.plateCalculatorIndices[0]].name == "Barbell Row" ? (total > props.barbellWeight + AVAILABLE_PLATES[0]*2 ? props.barbellWeight + AVAILABLE_PLATES[0]*2 : props.barbellWeight) :
                    props.barbellWeight
    if (initial >= total) {
        return []
    }
    const easyTargets = [props.barbellWeight]
    var extraPlates = 0
    while (easyTargets.slice(-1)[0] < total) {
        easyTargets.push(...AVAILABLE_PLATES.slice(0).reverse().map(p => props.barbellWeight + 2*p + extraPlates*AVAILABLE_PLATES[0]))
        extraPlates += 2
    }
    const diff = total - initial
    const roughTargets = [initial, initial + diff*0.25, initial+diff*0.5, initial+diff*0.75]
    const warmupWeights = roughTargets.map(roughTarget => easyTargets.reduce((prev, curr) => (Math.abs(curr - roughTarget) < Math.abs(prev - roughTarget) ? curr : prev)))
    return warmupWeights.map((weight, index) => `Set ${index + 1}: ${getPlatesString(weight, props)}`)
}

export const PlateCalculator = (props: PlateCalculatorProps): JSX.Element => {
    if (props.plateCalculatorIndices.length < 2) {
        return (<vstack />)
    }
    const close = () => {
        props.setPlateCalculatorIndices([])
    }

    const warmups = warmupStrings(props)
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" onPress={close} lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium" gap="small">
                    <text size="xlarge">Plate Calculator</text>
                    {warmups.length ? <text>Warmup Plates (per side):</text> : <vstack/>}
                    {warmups.map(s => <text>{s}</text>)}
                    <text size="large">Plates (per side): {getPlatesString(getTotalWeight(props), props)}</text>
                    <hstack alignment="center middle" width="100%">
                        <button icon="close" appearance="primary" onPress={close}>Close</button>
                    </hstack>
                </vstack>
            </vstack>
        </zstack>
    )
}
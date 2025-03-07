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

export const PlateCalculator = (props: PlateCalculatorProps): JSX.Element => {
    if (props.plateCalculatorIndices.length < 2) {
        return (<vstack />)
    }
    const close = () => {
        props.setPlateCalculatorIndices([])
    }
    function getTotalWeight(props: PlateCalculatorProps): number {
        return props.workout.exercises[props.plateCalculatorIndices[0]].sets[props.plateCalculatorIndices[1]].weight ?? 45
    }

    function getPlatesString(props: PlateCalculatorProps): string {
        var remainingWeight = (getTotalWeight(props) - props.barbellWeight) / 2
        if (remainingWeight <= 0) {
            return "none"
        }
        const availablePlates = [45, 35, 25, 10, 5]
        var platesUsed: number[] = []
        while (remainingWeight >= availablePlates.slice(-1)[0]) {
            const nextPlate: number = availablePlates.find((availablePlate: number) => remainingWeight >= availablePlate) ?? 45
            platesUsed.push(nextPlate)
            remainingWeight -= nextPlate
        }
        return platesUsed.join(", ")
    }

    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" onPress={close} lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium">
                    <text>Total Weight: {getTotalWeight(props)}</text>
                    <text>Barbell Weight: {props.barbellWeight}</text>
                    <text>Plates (per side): {getPlatesString(props)}</text>
                    <spacer/>
                    <hstack alignment="center middle" width="100%">
                        <button icon="close" appearance="primary" onPress={close}>Close</button>
                    </hstack>
                </vstack>
            </vstack>
        </zstack>
    )
}
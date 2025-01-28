import { Devvit } from '@devvit/public-api';

interface RepPickerProps {
    maxWidth: number
    setReps: (reps: number) => void
    closePicker: () => void
}

interface RepButtonProps {
    reps: number
    setReps: (reps: number) => void
}

const RepButton = (props: RepButtonProps): JSX.Element => {
    return <button height="40px" width="50px" onPress={() => props.setReps(props.reps)}>{props.reps}</button>
}

function gridOfButtons(start: number, end: number, buttonsPerRow: number, setReps: (reps: number) => void): JSX.Element {
    var rows = []
    for (var i=start; i<end; i+=buttonsPerRow) {
        rows.push(rowOfButtons(i, i+buttonsPerRow, setReps));
    }
    return <vstack cornerRadius='medium' backgroundColor='lightgray' gap="small" padding='small' alignment="center middle">{rows}</vstack>
}

function rowOfButtons(start: number, end: number, setReps: (reps: number) => void): JSX.Element {
    var buttons = []
    for (var i=start; i<end; i++) {
        buttons.push(<RepButton reps={i} setReps={setReps}/>)
    }
    return <hstack gap="small" alignment="center middle">{buttons}</hstack>
}

export const RepPicker = (props: RepPickerProps): JSX.Element => {
    return (
        <zstack height="100%" width="100%" alignment="center middle">
            <vstack height="100%" width="100%" onPress={props.closePicker} />
            <vstack height="100%" alignment="center middle">
                <spacer grow />
                {gridOfButtons(1, 31, props.maxWidth > 400 ? 10 : 5, props.setReps)}
                <spacer grow />
            </vstack>
        </zstack>
    )
}
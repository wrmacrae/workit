import { Devvit } from '@devvit/public-api';

interface MenuProps {
    setShowMenu: (showMenu: boolean) => void
    showMenu: boolean
    newExercise: () => void
    newWorkout: () => void
    resetWorkout: () => void
    isAuthor: boolean
    toggleEditMode: () => void
    editMode: boolean
}

export const Menu = (props: MenuProps): JSX.Element => {
    return (<vstack padding="small" gap="small">
    <button appearance="bordered" onPress={() => props.setShowMenu(!props.showMenu)} icon={props.showMenu ? "close" : "menu-fill"}></button>
    {props.showMenu ?
      <vstack darkBackgroundColor='rgb(26, 40, 45)' lightBackgroundColor='rgb(234, 237, 239)' cornerRadius='medium'>
        <hstack padding="small" onPress={props.newExercise}><spacer/><icon lightColor='black' darkColor='white' name="add" /><spacer/><text lightColor='black' darkColor='white' weight="bold">New Exercise</text><spacer/></hstack>
        <hstack padding="small" onPress={props.newWorkout}><spacer/><icon lightColor='black' darkColor='white' name="text-post" /><spacer/><text lightColor='black' darkColor='white' weight="bold">New Workout</text><spacer/></hstack>
        {/* <hstack padding="small" onPress={() => console.log("not yet implemented")}><spacer/><icon lightColor='black' darkColor='white' name="settings" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Settings</text><spacer/></hstack> */}
        <hstack padding="small" onPress={props.resetWorkout}><spacer/><icon lightColor='black' darkColor='white' name="delete" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Reset Workout</text><spacer/></hstack>
        {props.isAuthor ?
        <hstack padding="small" onPress={props.toggleEditMode}><spacer/><icon lightColor='black' darkColor='white' name={props.editMode ? "edit-fill": "edit"} /><spacer/><text lightColor='black' darkColor='white' weight="bold">{props.editMode ? "Dis" : "En"}able Edit Mode</text><spacer/></hstack>
        :<vstack/>}
      </vstack>
     : <vstack/> }
  </vstack>)
}
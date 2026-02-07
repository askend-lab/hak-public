import { Icon, IconSize, IconWeight } from "./Icon";

interface IconComponentProps {
  size?: IconSize;
  weight?: IconWeight;
  filled?: boolean;
  className?: string;
}

export const PlayIcon = (props: IconComponentProps) => (
  <Icon name="play_arrow" {...props} />
);
export const PauseIcon = (props: IconComponentProps) => (
  <Icon name="pause" {...props} />
);
export const CloseIcon = (props: IconComponentProps) => (
  <Icon name="close" {...props} />
);
export const EditIcon = (props: IconComponentProps) => (
  <Icon name="edit" {...props} />
);
export const TrashIcon = (props: IconComponentProps) => (
  <Icon name="delete" {...props} />
);
export const DownloadIcon = (props: IconComponentProps) => (
  <Icon name="download" {...props} />
);
export const SearchIcon = (props: IconComponentProps) => (
  <Icon name="search" {...props} />
);
export const ChevronDownIcon = (props: IconComponentProps) => (
  <Icon name="expand_more" {...props} />
);
export const ChevronUpIcon = (props: IconComponentProps) => (
  <Icon name="expand_less" {...props} />
);
export const ChevronLeftIcon = (props: IconComponentProps) => (
  <Icon name="chevron_left" {...props} />
);
export const ChevronRightIcon = (props: IconComponentProps) => (
  <Icon name="chevron_right" {...props} />
);
export const ShareIcon = (props: IconComponentProps) => (
  <Icon name="share" {...props} />
);
export const CheckIcon = (props: IconComponentProps) => (
  <Icon name="check" {...props} />
);
export const HelpIcon = (props: IconComponentProps) => (
  <Icon name="help" {...props} />
);
export const InfoIcon = (props: IconComponentProps) => (
  <Icon name="info" {...props} />
);
export const VolumeIcon = (props: IconComponentProps) => (
  <Icon name="volume_up" {...props} />
);
export const MuteIcon = (props: IconComponentProps) => (
  <Icon name="volume_off" {...props} />
);
export const SpeedIcon = (props: IconComponentProps) => (
  <Icon name="speed" {...props} />
);
export const PlusCircleIcon = (props: IconComponentProps) => (
  <Icon name="add_circle" {...props} />
);
export const DocumentPlusIcon = (props: IconComponentProps) => (
  <Icon name="note_add" {...props} />
);
export const DragHandleIcon = (props: IconComponentProps) => (
  <Icon name="drag_indicator" {...props} />
);
export const MoreIcon = (props: IconComponentProps) => (
  <Icon name="more_horiz" {...props} />
);
export const BackIcon = (props: IconComponentProps) => (
  <Icon name="arrow_back" {...props} />
);
export const StopIcon = (props: IconComponentProps) => (
  <Icon name="stop" {...props} />
);
export const AddIcon = (props: IconComponentProps) => (
  <Icon name="add" {...props} />
);
export const MusicNoteIcon = (props: IconComponentProps) => (
  <Icon name="music_note" {...props} />
);
export const ErrorIcon = (props: IconComponentProps) => (
  <Icon name="error" {...props} />
);
export const ArrowForwardIcon = (props: IconComponentProps) => (
  <Icon name="arrow_forward" {...props} />
);
export const CheckCircleIcon = (props: IconComponentProps) => (
  <Icon name="check_circle" {...props} />
);
export const MenuIcon = (props: IconComponentProps) => (
  <Icon name="menu" {...props} />
);
export const TaskIcon = (props: IconComponentProps) => (
  <Icon name="assignment" {...props} />
);

// Re-export types for convenience
export type { IconSize, IconWeight } from "./Icon";
export { Icon } from "./Icon";

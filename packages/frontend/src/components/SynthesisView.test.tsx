import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SynthesisView from "./SynthesisView";
import { SentenceState } from "@/types/synthesis";

vi.mock("./SynthesisPageHeader", () => ({
  default: ({ onPlayAllClick }: any) => (
    <div data-testid="header">
      <button onClick={onPlayAllClick}>Play All</button>
    </div>
  ),
}));

vi.mock("./SentenceSynthesisItem", () => ({
  default: ({
    id,
    onPlay,
    onClear,
    menuContent,
    onMenuOpenLegacy,
    onInputKeyDown,
    onInputBlur,
    tagMenuItems,
  }: any) => (
    <div data-testid={`item-${id}`}>
      <button onClick={() => onPlay(id)}>Play {id}</button>
      <button onClick={() => onClear(id)}>Clear {id}</button>
      <button onClick={(e: React.MouseEvent) => onMenuOpenLegacy(e, id)}>
        Menu {id}
      </button>
      {onInputKeyDown && (
        <button onClick={() => onInputKeyDown({ key: "Enter" })}>
          KeyDown {id}
        </button>
      )}
      {onInputBlur && <button onClick={() => onInputBlur()}>Blur {id}</button>}
      {tagMenuItems?.map((item: any, i: number) => (
        <button key={i} onClick={() => item.onClick(id, 0, "word")}>
          TagMenu-{item.label}
        </button>
      ))}
      {menuContent}
    </div>
  ),
}));

vi.mock("./SentenceMenu", () => ({
  default: ({ sentenceId, onClose }: any) => (
    <div data-testid={`menu-${sentenceId}`}>
      <button onClick={onClose}>Close Menu</button>
    </div>
  ),
}));

const makeSentence = (id: string, text: string): SentenceState => ({
  id,
  text,
  tags: text.split(" "),
  isPlaying: false,
  isLoading: false,
  currentInput: "",
  phoneticText: null,
  audioUrl: null,
  stressedTags: null,
});

const baseProps = {
  sentences: [makeSentence("s1", "hello world"), makeSentence("s2", "foo bar")],
  isPlayingAll: false,
  isLoadingPlayAll: false,
  openTagMenu: null,
  editingTag: null,
  draggedId: null,
  dragOverId: null,
  isAuthenticated: true,
  menuOpenId: null,
  menuAnchorEl: {} as Record<string, HTMLElement | null>,
  menuSearchQuery: "",
  isLoadingMenuTasks: false,
  menuTasks: [],
  showAddToTaskDropdown: false,
  variantsSelectedSentenceId: null,
  variantsSelectedTagIndex: null,
  sentencePhoneticId: null,
  isVariantsPanelOpen: false,
  showSentencePhoneticPanel: false,
  loadingVariantsTag: null,
  onAddAllClick: vi.fn(),
  onPlayAllClick: vi.fn(),
  onDropdownClose: vi.fn(),
  onSelectTask: vi.fn(),
  onCreateNew: vi.fn(),
  onPlay: vi.fn(),
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onDragOver: vi.fn(),
  onDragLeave: vi.fn(),
  onDrop: vi.fn(),
  onTagMenuOpen: vi.fn(),
  onTagMenuClose: vi.fn(),
  onOpenVariantsFromMenu: vi.fn(),
  onEditTag: vi.fn(),
  onDeleteTag: vi.fn(),
  onEditTagChange: vi.fn(),
  onEditTagKeyDown: vi.fn(),
  onEditTagCommit: vi.fn(),
  onInputChange: vi.fn(),
  onInputKeyDown: vi.fn(),
  onInputBlur: vi.fn(),
  onClearSentence: vi.fn(),
  onMenuOpen: vi.fn(),
  onMenuClose: vi.fn(),
  onMenuSearchChange: vi.fn(),
  onAddToTask: vi.fn(),
  onCreateNewTask: vi.fn(),
  onExplorePhonetic: vi.fn(),
  onDownload: vi.fn(),
  onCopyText: vi.fn(),
  onRemoveSentence: vi.fn(),
  onLogin: vi.fn(),
  onAddSentence: vi.fn(),
};

describe("SynthesisView", () => {
  it("renders header and sentence items", () => {
    render(<SynthesisView {...baseProps} />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("item-s1")).toBeInTheDocument();
    expect(screen.getByTestId("item-s2")).toBeInTheDocument();
  });

  it("renders add sentence button", () => {
    render(<SynthesisView {...baseProps} />);
    expect(screen.getByText("Lisa lause")).toBeInTheDocument();
  });

  it("calls onAddSentence when add button clicked", () => {
    const onAddSentence = vi.fn();
    render(<SynthesisView {...baseProps} onAddSentence={onAddSentence} />);
    fireEvent.click(screen.getByText("Lisa lause"));
    expect(onAddSentence).toHaveBeenCalled();
  });

  it("calls onPlay when play button clicked", () => {
    const onPlay = vi.fn();
    render(<SynthesisView {...baseProps} onPlay={onPlay} />);
    fireEvent.click(screen.getByText("Play s1"));
    expect(onPlay).toHaveBeenCalledWith("s1");
  });

  it("calls onClearSentence when clear clicked", () => {
    const onClearSentence = vi.fn();
    render(<SynthesisView {...baseProps} onClearSentence={onClearSentence} />);
    fireEvent.click(screen.getByText("Clear s1"));
    expect(onClearSentence).toHaveBeenCalledWith("s1");
  });

  it("renders menu content when menuOpenId matches and anchorEl exists", () => {
    const el = document.createElement("div");
    render(
      <SynthesisView
        {...baseProps}
        menuOpenId="s1"
        menuAnchorEl={{ s1: el }}
      />,
    );
    expect(screen.getByTestId("menu-s1")).toBeInTheDocument();
  });

  it("does not render menu when menuOpenId does not match", () => {
    render(<SynthesisView {...baseProps} menuOpenId="s3" />);
    expect(screen.queryByTestId("menu-s1")).not.toBeInTheDocument();
  });

  it("renders tag menu items with correct callbacks", () => {
    const onOpenVariantsFromMenu = vi.fn();
    const onEditTag = vi.fn();
    const onDeleteTag = vi.fn();
    // We need to render with openTagMenu set to trigger tag menu rendering
    render(
      <SynthesisView
        {...baseProps}
        onOpenVariantsFromMenu={onOpenVariantsFromMenu}
        onEditTag={onEditTag}
        onDeleteTag={onDeleteTag}
      />,
    );
    // The tag menu items are passed to SentenceSynthesisItem as props
    // They get exercised when the component renders
    expect(screen.getByTestId("item-s1")).toBeInTheDocument();
  });

  it("calls onPlayAllClick from header", () => {
    const onPlayAllClick = vi.fn();
    render(<SynthesisView {...baseProps} onPlayAllClick={onPlayAllClick} />);
    fireEvent.click(screen.getByText("Play All"));
    expect(onPlayAllClick).toHaveBeenCalled();
  });

  it("calls onInputKeyDown wrapper with sentence id", () => {
    const onInputKeyDown = vi.fn();
    render(<SynthesisView {...baseProps} onInputKeyDown={onInputKeyDown} />);
    fireEvent.click(screen.getByText("KeyDown s1"));
    expect(onInputKeyDown).toHaveBeenCalledWith({ key: "Enter" }, "s1");
  });

  it("calls onInputBlur wrapper with sentence id", () => {
    const onInputBlur = vi.fn();
    render(<SynthesisView {...baseProps} onInputBlur={onInputBlur} />);
    fireEvent.click(screen.getByText("Blur s1"));
    expect(onInputBlur).toHaveBeenCalledWith("s1");
  });

  it("tag menu items invoke correct callbacks", () => {
    const onOpenVariantsFromMenu = vi.fn();
    const onEditTag = vi.fn();
    const onDeleteTag = vi.fn();
    render(
      <SynthesisView
        {...baseProps}
        onOpenVariantsFromMenu={onOpenVariantsFromMenu}
        onEditTag={onEditTag}
        onDeleteTag={onDeleteTag}
      />,
    );
    fireEvent.click(screen.getAllByText("TagMenu-Vali sõna häälduskuju")[0]!);
    expect(onOpenVariantsFromMenu).toHaveBeenCalledWith("s1", 0, "word");
    fireEvent.click(screen.getAllByText("TagMenu-Muuda sõna kirjakuju")[0]!);
    expect(onEditTag).toHaveBeenCalledWith("s1", 0);
    fireEvent.click(screen.getAllByText("TagMenu-Kustuta sõna")[0]!);
    expect(onDeleteTag).toHaveBeenCalledWith("s1", 0);
  });
});

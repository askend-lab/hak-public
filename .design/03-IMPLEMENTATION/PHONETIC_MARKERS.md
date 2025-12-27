# Phonetic Marker Transformation System

## Overview

The application now implements a two-layer phonetic marker system that simplifies the display of Vabamorf's elaborate phonetic markers for end users while preserving the full marker set for synthesis.

## Marker Mapping

### UI Display Markers (Simplified)

The UI shows only 4 essential phonetic markers to avoid overwhelming users:

| UI Symbol | Vabamorf Symbol | Estonian Name | English Description |
|-----------|-----------------|---------------|---------------------|
| ` (backtick) | < | Kolmas välde | Third pitch accent |
| ´ (acute) | ? | Rõhuline silp | Stressed syllable |
| ' (apostrophe) | ] | Palatalisatsioon | Palatalization |
| + (plus) | _ | Liitsõna piir | Compound word boundary |

### Omitted Markers

The following Vabamorf markers are omitted from the UI display but preserved in the background:

- `~` - n-k eraldus (n-k separation)
- `+` - morfeemi piir (morpheme boundary)
- `=` - tühik ühendites (space in compounds)
- `[` - käändelõpu eraldus (declension suffix separation)
- `.` - silbi piir (syllable boundary)

## Architecture

### Data Flow

```
Vabamorf API → transformToUI() → UI Display
                      ↓
                User Edits
                      ↓
            transformToVabamorf() → Synthesis/Storage
```

### Key Components

#### 1. Utility Functions ([utils/phoneticMarkers.ts](../utils/phoneticMarkers.ts))

- **`transformToUI(vabamorfText: string)`**: Converts Vabamorf markers to UI-friendly markers
  - Transforms mapped markers (< → `, ? → ´, ] → ', _ → +)
  - Omits non-mapped markers (~, +, =, [, etc.)
  - Preserves regular text characters

- **`transformToVabamorf(uiText: string)`**: Converts UI markers back to Vabamorf format
  - Used when saving user edits
  - Ensures synthesis receives proper Vabamorf format

#### 2. Component Integration ([components/StressedTextDisplay.tsx](../components/StressedTextDisplay.tsx))

The `StressedTextDisplay` component manages the transformation:

```typescript
// Display: Show UI-friendly version
const [editedText, setEditedText] = useState(transformToUI(stressedText) || '');

// Edit Mode: Start with UI version
const handleEdit = () => {
  setEditedText(transformToUI(stressedText) || '');
};

// Save: Convert back to Vabamorf format
const handleSave = () => {
  const vabamorfText = transformToVabamorf(editedText);
  onPhoneticTextChange(vabamorfText || '');
};
```

#### 3. Symbol Toolbar

The edit toolbar now shows only the 4 simplified markers:

```typescript
<button onClick={() => insertSymbol('`')} title="Kolmas välde">`</button>
<button onClick={() => insertSymbol('´')} title="Rõhuline silp">´</button>
<button onClick={() => insertSymbol("'")} title="Palatalisatsioon">'</button>
<button onClick={() => insertSymbol('+')} title="Liitsõna piir">+</button>
```

## Examples

### Example 1: Simple Word Transformation

**Vabamorf Output:**
```
m<ee_s
```

**UI Display:**
```
m`ee+s
```

**User Edits to:**
```
m`ee+se
```

**Sent to Synthesis:**
```
m<ee_se
```

### Example 2: Complex Phrase

**Vabamorf Output:**
```
p<ee+ti k?in+ni
```

**UI Display:**
```
p`eeti k´inni
```

(Notice: Vabamorf's `+` (morpheme boundary) is omitted, `<` becomes `, `?` becomes `´`)

### Example 3: Markers Omitted

**Vabamorf Output:**
```
k?uu]l+ma~n[d
```

**UI Display:**
```
k´uu'lmand
```

(Omitted: `+`, `~`, `[`)

## Benefits

1. **Simplified User Experience**: Users only see essential markers
2. **Preserved Accuracy**: Full Vabamorf markers retained for synthesis
3. **Consistent Transformations**: Bidirectional mapping ensures data integrity
4. **Easier Editing**: Simpler toolbar with fewer options

## Testing

Comprehensive test suite in [__tests__/phoneticMarkers.test.ts](../__tests__/phoneticMarkers.test.ts):

- ✅ Forward transformation (Vabamorf → UI)
- ✅ Reverse transformation (UI → Vabamorf)
- ✅ Marker omission
- ✅ Round-trip preservation
- ✅ Real-world Estonian examples

Run tests:
```bash
npm test phoneticMarkers.test.ts
```

## Future Considerations

- **Custom Marker Sets**: Allow advanced users to toggle full marker display
- **Marker Education**: Interactive guide explaining each marker's purpose
- **Validation**: Ensure user-entered markers are valid for synthesis

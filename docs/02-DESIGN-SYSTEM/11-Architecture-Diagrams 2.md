# Architecture Diagrams

## Three-Layer Architecture

```mermaid
flowchart TB
    subgraph Layer1[Layer 1: Design Tokens]
        Colors["Colors (80+ tokens)"]
        Typography["Typography (fonts, sizes, weights)"]
        Spacing["Spacing (4px grid)"]
        Borders["Borders (radii, widths)"]
        Opacity["Opacity (interaction states)"]
    end

    subgraph Layer2[Layer 2: Storybook Components]
        Button[Button]
        Input[Input]
        Avatar[Avatar]
        Checkbox[Checkbox]
        Radio[Radio]
        Select[Select]
    end

    subgraph Layer3[Layer 3: App Components]
        TaskManager[Task Manager]
        SynthesisView[Synthesis View]
        Panel[Panel]
        Paper[Paper]
        Modal[Modal Dialog]
        Footer[Footer]
    end

    Layer1 --> Layer2
    Layer1 --> Layer3
    Layer2 --> Layer3
```

- **Layer 1** provides all design values (tokens)
- **Layer 2** imports shared components from EKI Storybook
- **Layer 3** builds app-specific functionality on top
- Tokens flow down through all layers
- Lower layers can use upper layers, never the reverse

## Token System Flow

```mermaid
flowchart LR
    Design["Design Values"]
    CSS[":root CSS Custom Properties"]
    SCSS["SCSS Variable Aliases"]
    Components["Component SCSS"]
    UI["Browser Rendering"]

    Design --> CSS
    CSS --> SCSS
    SCSS --> Components
    Components --> UI
```

- Design values are defined once in token files
- CSS custom properties enable runtime theming
- SCSS aliases provide compile-time IDE autocomplete
- Components reference SCSS aliases exclusively
- Browser resolves CSS variables at render time

## Component Decision Tree

```mermaid
flowchart TD
    Start["Need to style a component"]
    Check{"Exists in Storybook?"}
    UseStorybook["Use Storybook classes directly"]
    Reusable{"Reusable across EKI apps?"}
    CreatePropose["Create component + document for proposal"]
    CreateApp["Create app-specific component"]
    DoneStorybook["Done: Import Storybook styles"]
    DoneBacklog["Done: Document for future Storybook"]
    DoneApp["Done: Internal use only"]

    Start --> Check
    Check -->|Yes| UseStorybook
    Check -->|No| Reusable
    Reusable -->|Yes| CreatePropose
    Reusable -->|No| CreateApp
    UseStorybook --> DoneStorybook
    CreatePropose --> DoneBacklog
    CreateApp --> DoneApp
```

- Always check Storybook first
- Use existing components when possible
- Create new components following BEM and token standards
- Document reusable components for potential Storybook inclusion

## ITCSS Import Order

```mermaid
flowchart TD
    Settings["Settings Layer: Design Tokens (lowest specificity)"]
    Base["Base Layer: Resets and Element Styles"]
    Components["Components Layer: BEM Classes (highest specificity)"]
    Output["Compiled CSS (correct cascade)"]

    Settings -->|"Import first"| Base
    Base -->|"Import second"| Components
    Components -->|"Generate"| Output
```

- Settings (tokens) are imported first
- Base styles use tokens for resets
- Components use tokens and base styles
- Specificity increases down the triangle
- Import order is enforced in `main.scss`

---

## Summary

1. **Three Layers**: Tokens -> Storybook -> App Components
2. **Design Tokens**: Single source of truth for all values
3. **BEM Methodology**: Consistent, predictable component naming
4. **ITCSS**: Import order ensures correct cascade
5. **Storybook Integration**: Reuse shared components, propose improvements

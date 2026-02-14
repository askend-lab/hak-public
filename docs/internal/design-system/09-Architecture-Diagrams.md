# Architecture Diagrams

## Three-Layer Architecture

```mermaid
flowchart TB
    subgraph Layer1[Layer 1: Design Tokens]
        Colors[Colors<br/>50+ color tokens]
        Typography[Typography<br/>Fonts, sizes, weights]
        Spacing[Spacing<br/>4px grid system]
        Borders[Borders<br/>Radii, widths]
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
        AudioPlayer[Audio Player]
        Panel[Panel]
        Paper[Paper]
        Playlist[Playlist]
        Modal[Modal Dialog]
    end
    
    Layer1 --> Layer2
    Layer1 --> Layer3
    Layer2 --> Layer3
    
    style Layer1 fill:#E3EFFB
    style Layer2 fill:#D7E5F2
    style Layer3 fill:#FBFCFE
```

**Description:**
- **Layer 1** provides all design values (tokens)
- **Layer 2** imports shared components from storybook
- **Layer 3** builds app-specific functionality on top
- Tokens flow down through all layers
- Lower layers can use upper layers, never the reverse

## Token System Flow

```mermaid
flowchart LR
    Design[Design Values<br/>Colors, spacing, etc.]
    CSS[:root<br/>CSS Custom Properties<br/>--color-primary]
    SCSS[SCSS Aliases<br/>Variables<br/>dollar-color-primary]
    Components[Component Styles<br/>.component class]
    UI[UI Rendering<br/>Browser display]
    
    Design --> CSS
    CSS --> SCSS
    SCSS --> Components
    Components --> UI
    
    style Design fill:#FFF5F1
    style CSS fill:#E3EFFB
    style SCSS fill:#D7E5F2
    style Components fill:#FBFCFE
    style UI fill:#E3FBE3
```

**Description:**
- Design values defined once
- CSS custom properties enable runtime theming
- SCSS aliases provide compile-time benefits
- Components reference aliases
- Browser renders using CSS variables

## Component Creation Decision Tree

```mermaid
flowchart TD
    Start[Need to style<br/>component]
    Check{Exists in<br/>Storybook?}
    UseStorybook[Use storybook<br/>classes directly]
    Reusable{Reusable across<br/>EKI apps?}
    CreatePropose[Create component<br/>+ Add to backlog]
    CreateApp[Create app-specific<br/>component]
    DoneStorybook[Done: Import<br/>storybook styles]
    DoneBacklog[Done: Document<br/>for proposal]
    DoneApp[Done: Internal<br/>use only]
    
    Start --> Check
    Check -->|Yes| UseStorybook
    Check -->|No| Reusable
    Reusable -->|Yes| CreatePropose
    Reusable -->|No| CreateApp
    UseStorybook --> DoneStorybook
    CreatePropose --> DoneBacklog
    CreateApp --> DoneApp
    
    style Start fill:#E3EFFB
    style Check fill:#FFF5F1
    style Reusable fill:#FFF5F1
    style UseStorybook fill:#E3FBE3
    style CreatePropose fill:#FDF0E1
    style CreateApp fill:#FBFCFE
```

**Description:**
- Always check storybook first
- Use existing components when possible
- Create new components following standards
- Document reusable components for storybook
- Keep app-specific components internal

## ITCSS Import Order

```mermaid
flowchart TD
    Settings[Settings Layer<br/>Design Tokens<br/>Lowest specificity]
    Base[Base Layer<br/>Resets & Elements<br/>Low specificity]
    Components[Components Layer<br/>BEM Classes<br/>Highest specificity]
    Output[Compiled CSS<br/>Correct cascade]
    
    Settings -->|Import first| Base
    Base -->|Import second| Components
    Components -->|Generate| Output
    
    style Settings fill:#E3EFFB
    style Base fill:#D7E5F2
    style Components fill:#FBFCFE
    style Output fill:#E3FBE3
```

**Description:**
- Settings (tokens) imported first
- Base styles use tokens
- Components use tokens and base styles
- Specificity increases down the triangle
- Import order enforced in main.scss

## Summary

The EKI Design System provides a robust, scalable architecture for building consistent user interfaces. Key takeaways:

1. **Three Layers**: Tokens → Storybook → App Components
2. **Design Tokens**: Single source of truth for all values
3. **BEM Methodology**: Consistent, predictable component naming
4. **Quality Standards**: Enforced through validation scripts
5. **Storybook Integration**: Reuse shared components, propose improvements

For quick reference, see [`DESIGN_SYSTEM_QUICK_REFERENCE.md`](DESIGN_SYSTEM_QUICK_REFERENCE.md).

For onboarding, see [`DESIGN_SYSTEM_ONBOARDING.md`](DESIGN_SYSTEM_ONBOARDING.md).

---

**Questions or Issues?**

- Token governance: [`styles/tokens/README.md`](../styles/tokens/README.md)
- Style guide: [`styles/README.md`](../styles/README.md)
- Component proposals: [`STORYBOOK-BACKLOG.md`](STORYBOOK-BACKLOG.md)
- Validation: `npm run validate:design`

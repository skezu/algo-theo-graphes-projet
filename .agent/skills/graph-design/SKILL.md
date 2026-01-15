---
name: Process Mapping Interface Design
description: Comprehensive guide for designing the Process Mapping interface, including layout, panels, colors, typography, and spacing.
---

# Process Mapping Interface Design

This skill defines the specific design language for the Process Mapping feature (`app/(app)/process-mapping`), ensuring consistency with the "Gold Standard" minimal design philosophy while addressing the unique needs of a canvas-based diagramming tool.

## Core Layout

The process mapping interface typically follows a full-screen application layout with a central canvas (ReactFlow) and floating overlay panels.

### Canvas Container
- **Structure**: `h-screen w-full flex flex-col overflow-hidden`
- **Canvas Area**: `flex-1 relative bg-background`
- **Grid/Background**: Uses a unicolor background (no dots or lines) by design. The `<Background />` component may be omitted or configured to be transparent/solid.

## Floating Panels (Properties, AI Chat, Tools)

Panels within the process mapping canvas should appear as "floating" elements rather than fixed sidebars. This preserves the feeling of an infinite canvas.

### Container Style
- **Classes**: `bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`
- **Border**: `border border-border/50`
- **Shape**: `rounded-2xl` (Larger radius for floating elements)
- **Shadow**: `shadow-lg` (to separate from canvas)
- **Margin**: `m-4` (spacing from screen edges)
- **Width**: Standard widths are `w-[380px]` or `w-[400px]` for side panels.

```tsx
<Panel 
  position="top-right" 
  className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-2xl border w-[380px] m-4 overflow-hidden flex flex-col shadow-lg"
>
  {/* Content */}
</Panel>
```

### Internal Layout (The "Panel Architecture")

1.  **Header**
    - **Height/Padding**: `px-4 py-3` or `p-4`
    - **Border**: `border-b` (optional, but often used for separation)
    - **Content**: Title (`font-semibold text-sm`), Badges (`variant="outline"`), and Action buttons (Close/Minimize).
    
    ```tsx
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-sm">Node Properties</h3>
        <Badge variant="outline" className="text-xs">Task</Badge>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <X className="h-4 w-4" />
      </Button>
    </div>
    ```

2.  **Scrollable Body**
    - **Classes**: `flex-1 overflow-y-auto p-4 space-y-4`
    - **Content**: Form inputs, descriptions, lists.

3.  **Footer (Optional)**
    - **Classes**: `p-4 border-t bg-muted/20`
    - **Use**: Primary actions (Save, Apply) or status info.

## Form Elements & Typography

Follow the application-wide typography but sized appropriately for high-density panels.

### Typography
- **Panel Titles**: `text-sm font-semibold`
- **Field Labels**: `text-sm font-medium` or `text-xs font-medium text-muted-foreground`
- **Body Text**: `text-sm text-foreground`
- **Meta/ID Text**: `text-xs font-mono text-muted-foreground`

### Inputs
- **Standard**: Shadcn `Input` with `h-9` (compact height).
- **Read-only**: `bg-muted` to clearly distinguish from editable fields.
- **Textarea**: `min-h-[80px] resize-none`.

```tsx
<div className="space-y-2">
  <Label className="text-xs font-medium text-muted-foreground">Description</Label>
  <Textarea className="min-h-[80px]" placeholder="Describe the process step..." />
</div>
```

## Colors & Visual Hierarchy

- **Background**: `bg-background`
- **Panel Background**: `bg-background/95` (Glassmorphism effect)
- **Primary Elements**: `text-foreground`
- **Secondary/Meta**: `text-muted-foreground`
- **Borders**: `border-border`
- **Accents**: Use standard Tailwind colors (e.g., `text-primary`, `bg-primary`) sparingly for active states or primary actions.

## Spacing System (Compact)

Because screen real estate is valuable on a canvas:
- **Gap/Spacing**: `gap-2` or `space-y-2` for tight grouping.
- **Section Spacing**: `space-y-4` between major form groups.
- **Panel Padding**: `p-4` standard, `p-3` for tighter headers.

## Example: Edge Properties Panel

This references the existing design pattern found in `components/diagram/edge-properties-panel.tsx`.

```tsx
export function PropertiesPanel() {
  return (
    <Panel position="top-right" className="...">
       {/* Header */}
       <div className="px-4 py-3 flex items-center justify-between shrink-0">
         {/* ... */}
       </div>
       
       {/* Content */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <Label>Source</Label>
            <Input readOnly className="h-9 bg-muted" />
          </div>
       </div>
    </Panel>
  )
}
```

# CSS Utilities & Style Guide

## Complete reference for all custom CSS utilities and classes available in the dashboard

---

## Page Structure Utilities

### `.page-header`
**Purpose**: Elevated header section with shadow for page titles  
**Use Case**: Main page title containers

```tsx
<div className="page-header">
  <h1 className="text-3xl font-bold">Page Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

### `.header-section`
**Purpose**: Separates header area from content with bottom border  
**Use Case**: Main header container that sits above tables/content

```tsx
<div className="header-section">
  {/* Header content */}
</div>
```

### `.heading-group`
**Purpose**: Groups title and description with proper spacing  
**Includes**: Automatic styling for h1 and p children

```tsx
<div className="heading-group">
  <h1>Users</h1>
  <p>Manage platform users, roles, and permissions</p>
</div>
```

---

## Layout Utilities

### `.filters-section`
**Purpose**: Responsive filter layout  
**Behavior**: 
- Mobile: Stacked vertically
- Desktop: Horizontal with space-between

```tsx
<div className="filters-section">
  <SearchInput />
  <div className="filters-group">
    <Select />
    <Select />
  </div>
</div>
```

### `.filters-group`
**Purpose**: Groups multiple filter controls together  
**Behavior**: Horizontal with gap, wraps on mobile

---

## Typography Utilities

### `.user-name`
**Purpose**: Primary user name display  
**Features**:
- Font-weight: 600
- Auto text truncation
- Max-width: 200px

```tsx
<div className="user-name">John Doe</div>
```

### `.user-email` / `.secondary-text`
**Purpose**: Secondary text (emails, metadata)  
**Features**:
- Muted color
- Font-size: 0.875rem

```tsx
<div className="user-email">john@example.com</div>
```

### `.user-info`
**Purpose**: Container for user name + email stack  
**Behavior**: Vertical flex with tight gap

```tsx
<div className="user-info">
  <div className="user-name">John Doe</div>
  <div className="user-email">john@example.com</div>
</div>
```

### `.truncate-text`
**Purpose**: Truncate long text with ellipsis  
**Features**:
- Max-width: 200px
- Ellipsis on overflow

---

## Table Utilities

### `.numeric-cell`
**Purpose**: Proper alignment and formatting for numeric data  
**Features**:
- Center-aligned
- Tabular numbers (digits align vertically)

```tsx
<td className="numeric-cell">123</td>
```

### Automatic Table Enhancements
These are applied automatically to all tables:

**Sticky Headers**
```css
thead {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

**Row Hover**
```css
tbody tr:hover {
  background-color: var(--color-muted);
  cursor: pointer;
}
```

**Zebra Striping**
```css
tbody tr:nth-child(even) {
  background-color: var(--color-muted)/20;
}
```

---

## Badge/Status Utilities

### `.badge-soft`
**Purpose**: Soft badge appearance (subtle background)

### Status Variants (Automatic)
Apply these classes to badges for semantic coloring:

```tsx
<Badge className="status-active">Active</Badge>
<Badge className="status-inactive">Inactive</Badge>
<Badge className="status-pending">Pending</Badge>
```

**Colors**:
- `.status-active` - Green tones (light bg, dark text)
- `.status-inactive` - Gray tones (neutral)
- `.status-pending` - Yellow/amber tones (warning)

---

## Interactive Element Utilities

### `.action-icon` / `.action-btn`
**Purpose**: Action buttons with circular hover effect  
**Features**:
- Perfect circle background on hover
- Scale animation (1.05 on hover, 0.95 on active)
- Smooth transitions

```tsx
<button className="action-icon">
  <EyeIcon />
</button>
```

### `.card-interactive`
**Purpose**: Cards that lift on hover  
**Features**:
- translateY(-2px) on hover
- Enhanced shadow

```tsx
<Card className="card-interactive">
  {/* Card content */}
</Card>
```

### `.search-input`
**Purpose**: Enhanced search input with focus glow  
**Features**:
- Primary-colored glow ring on focus
- Smooth transition

```tsx
<Input className="search-input" />
```

---

## Animation Utilities

### `.skeleton`
**Purpose**: Loading skeleton animation  
**Animation**: Smooth pulse effect (2s loop)

```tsx
<div className="skeleton h-4 w-32 bg-muted rounded" />
```

---

## Automatic Enhancements

These styles are applied automatically without classes:

### All Interactive Elements
- **Transitions**: 150ms ease-in-out
- **Focus rings**: 2px primary color outline
- **Disabled states**: 50% opacity, not-allowed cursor

### Buttons
- **Hover lift**: translateY(-1px) + shadow
- **Active press**: translateY(0)

### Scrollbars
- **Width**: 8px
- **Custom styling**: Matches theme colors
- **Smooth**: Rounded, subtle

### Text Selection
- **Background**: Primary brand color
- **Text**: Primary foreground color

---

## Usage Examples

### Complete Page Header
```tsx
<div className="header-section">
  <div className="heading-group">
    <h1>Users</h1>
    <p>Manage platform users, roles, and permissions</p>
  </div>
  
  <div className="filters-section">
    <SearchInput className="search-input" placeholder="Search users..." />
    <div className="filters-group">
      <Select>
        <SelectTrigger>All Roles</SelectTrigger>
      </Select>
      <Select>
        <SelectTrigger>All Status</SelectTrigger>
      </Select>
    </div>
  </div>
</div>
```

### User Table Row
```tsx
<tr>
  <td>
    <div className="user-info">
      <div className="user-name">Prof. Adela Lang</div>
      <div className="user-email">kkrajcik@example.net</div>
    </div>
  </td>
  <td>
    <Badge className="status-active">Active</Badge>
  </td>
  <td className="numeric-cell">0</td>
  <td>
    <button className="action-icon">
      <EyeIcon />
    </button>
  </td>
</tr>
```

### Interactive Stat Card
```tsx
<Card className="card-interactive">
  <CardHeader>
    <CardTitle>Total Users</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-stat-value">1,234</div>
  </CardContent>
</Card>
```

---

## Design Principles

### 1. Elevation Over Borders
- Use shadows and background changes instead of borders
- Borders are extremely subtle (almost invisible)

### 2. Smooth Transitions
- All interactive elements: 150ms ease-in-out
- Buttons: Additional transform animations
- Cards: Subtle lift on hover

### 3. Clear Hierarchy
- Primary text: font-weight 600
- Secondary text: muted color, smaller size
- Numeric data: center-aligned, tabular figures

### 4. Accessibility First
- Focus outlines on all interactive elements
- Keyboard navigation support
- Disabled states clearly indicated

### 5. Responsive by Default
- Mobile-first approach
- Automatic stacking on small screens
- Touch-friendly target sizes

---

## Browser Support

All utilities support:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ All modern mobile browsers

Custom scrollbars require:
- `-webkit-scrollbar` (Chrome, Safari, Edge)
- Falls back to default on Firefox

---

## Dark Mode

All utilities automatically adapt to dark mode:
- Color tokens use CSS variables
- Badge colors adjust automatically
- Shadows become more pronounced
- All animations remain smooth

---

## Performance

All animations use:
- `transform` (GPU-accelerated)
- `opacity` (GPU-accelerated)
- `will-change` where appropriate

Avoid:
- Animating `width`, `height`, `top`, `left` (causes layout shifts)
- Use `transform` instead

---

## Summary

✅ **Page Structure**: `.page-header`, `.header-section`, `.heading-group`  
✅ **Layouts**: `.filters-section`, `.filters-group`  
✅ **Typography**: `.user-name`, `.user-email`, `.truncate-text`  
✅ **Tables**: `.numeric-cell`, automatic sticky headers  
✅ **Badges**: `.status-active`, `.status-inactive`, `.status-pending`  
✅ **Interactive**: `.action-icon`, `.card-interactive`, `.search-input`  
✅ **Animations**: `.skeleton`, automatic transitions  
✅ **Automatic**: Focus states, hover effects, disabled states

Use these utilities to maintain consistency across the entire dashboard! 🎨✨

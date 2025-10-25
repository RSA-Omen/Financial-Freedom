# NODUS DESIGN SYSTEM
**Single Source of Truth for Global CSS Integration**

## QUICK START

### Active Theme
```html
<link rel="stylesheet" href="css-themes/nodus-matte.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
```

### Theme Options
- `nodus-matte.css` - **ACTIVE** - Professional dark carbon fiber with mint accents
- `nodus-carbon-fiber.css` - Premium with enhanced effects
- `nodus-clean.css` - Minimal light theme

---

## DESIGN PHILOSOPHY

**Core Principles:**
- Matte over glossy surfaces
- Function over form
- Subtle accents for important actions only
- Clean typography hierarchy
- Consistent spacing patterns

**Color Palette:**
- Background: Carbon grays (#0a0a0a to #262626)
- Primary: Mint green (#00d4aa)
- Text: White (#ffffff) and light gray (#d4d4d4)
- Status: Success (#22c55e), Warning (#f59e0b), Danger (#ef4444), Info (#3b82f6)

**Typography:**
- Font: Inter family
- Hierarchy: Clean, readable text structure

---

## CSS VARIABLES

### Background Colors
```css
--nodus-bg-primary: #0a0a0a
--nodus-bg-secondary: #171717
--nodus-bg-tertiary: #262626
```

### Text Colors
```css
--nodus-text-primary: #ffffff
--nodus-text-secondary: #d4d4d4
--nodus-text-muted: #a3a3a3
```

### Accent Colors
```css
--nodus-primary: #00d4aa
--nodus-success: #22c55e
--nodus-warning: #f59e0b
--nodus-danger: #ef4444
--nodus-info: #3b82f6
```

### Layout
```css
--nodus-border: #404040
--nodus-radius-lg: 0.5rem
--nodus-transition-normal: all 0.2s ease
--nodus-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

---

## COMPONENT CLASSES

### Cards
```html
<div class="card">
    <div class="card-header">
        <h2 class="card-title">Title</h2>
    </div>
    <div class="card-body">
        <p class="text-gray-300">Content</p>
    </div>
</div>
```

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline">Outline</button>
```

### Status Badges
```html
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
<span class="badge badge-info">Info</span>
```

### Navigation
```html
<nav class="navbar navbar-dark">
    <div class="navbar-brand">Brand</div>
    <div class="navbar-nav">
        <a class="nav-link" href="#">Link</a>
    </div>
</nav>
```

---

## INTEGRATION PATTERNS

### Flask Applications
```python
# In templates, use Nodus variables
<style>
    .custom-component {
        background: var(--nodus-bg-secondary);
        color: var(--nodus-text-primary);
        border: 1px solid var(--nodus-border);
    }
</style>
```

### Cache Busting
```html
<link rel="stylesheet" href="/static/css/nodus-design-system.css?v=20251010">
```

### Static File Serving
```python
# Flask app.py
app = Flask(__name__, static_folder='static', static_url_path='/static')

@app.route('/static/css/<path:filename>')
def static_css(filename):
    return send_from_directory('static/css', filename)
```

---

## PORT ASSIGNMENTS

### Development Services
- 3000 - WorkPulse Frontend
- 5000 - Ortelius Dashboard
- 5003 - WorkPulse Backend

### Media & Content
- 4000 - Dashy Dashboard
- 8096 - Jellyfin Media Server
- 5002 - Video Curator

### Management
- 9000 - Portainer
- 5678 - n8n Workflow

### Development Range
- 8080-8089 - Local development servers

---

## TROUBLESHOOTING

### Common Issues

**CSS Not Loading:**
1. Check static file serving configuration
2. Verify file path in HTML link
3. Add cache-busting parameter
4. Check browser developer tools for 404 errors

**Variables Not Working:**
1. Ensure CSS file is loaded before custom styles
2. Use `var(--nodus-variable-name)` syntax
3. Check CSS file contains variable definitions

**Theme Not Applying:**
1. Verify correct CSS file is linked
2. Check for conflicting styles
3. Ensure CSS loads after conflicting stylesheets

### File Structure
```
project/
├── static/css/
│   └── nodus-design-system.css  # Copy from css-themes/
├── templates/
│   └── *.html                   # Include CSS link
└── app.py                       # Configure static serving
```

---

## AI PROMPT CONTEXT

When working with AI for design decisions:

```
Use Nodus Design System: Professional matte aesthetic with carbon fiber inspiration.
Colors: Carbon grays (#0a0a0a to #262626) with mint green accents (#00d4aa).
Typography: Inter font family for clean hierarchy.
Components: Minimal, functional design with subtle hover states.
Effects: Avoid flashy animations, focus on clean lines and proper contrast.
Philosophy: Function over form, readability over visual spectacle.
```

---

## MAINTENANCE

### Updating Themes
1. Modify CSS files in `css-themes/`
2. Update cache-busting parameters
3. Test across all integrated projects

### Adding New Variables
1. Add to CSS `:root` selector
2. Document in this file
3. Update integration examples

### Project Integration
1. Copy CSS file to project static directory
2. Add HTML link with cache-busting
3. Use CSS variables for custom styling
4. Document any gaps in project `NODUS-GAPS.md`

---

*This file contains everything needed to work with the Nodus Design System. Keep it updated as the system evolves.*

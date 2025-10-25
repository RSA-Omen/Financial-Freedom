# AI Prompt Templates - The Essential 5

Five battle-tested templates that cover almost every scenario. Copy, fill in, paste.

---

## When to Use Which Template

| Template | Use When | Time to Fill |
|----------|----------|--------------|
| **The Big Boy** | Complex, important tasks with lots of requirements | 5-10 min |
| **Quick Task** | Simple, focused tasks - just get it done | 30 sec |
| **Interview Me** | You're not sure what you need or want guidance | 10 sec |
| **Fix This** | Something's broken or slow - need debugging help | 1-2 min |
| **Build This** | Creating something new (component, feature, doc) | 2-3 min |

---

## 1. 🚀 The Big Boy (Complex Tasks)

**When to use:**
- High-stakes features or refactoring
- Need to coordinate multiple files/systems
- Clear requirements but complex implementation
- Want comprehensive, production-ready results

**Don't use when:** Task is simple or exploratory

```
=== PROJECT CONTEXT ===
Project: [Name and type]
Tech Stack: [Languages, frameworks, versions]
Standards: [@reference-files]

=== THE CHALLENGE ===
What I'm trying to accomplish:
[Detailed description]

Why this matters:
[Business/user impact]

Current blockers:
[What's not working]

=== REQUIREMENTS ===
Must Have:
- [Critical 1]
- [Critical 2]
- [Critical 3]

Must NOT Have:
- [Anti-pattern to avoid 1]
- [Anti-pattern to avoid 2]

=== CONSTRAINTS ===
Technical: [Performance, browser support, etc.]
Business: [Timeline, dependencies]
Quality: [Testing, accessibility]

=== SUCCESS CRITERIA ===
This is complete when:
✓ [Measurable outcome 1]
✓ [Measurable outcome 2]
✓ [Measurable outcome 3]

=== COLLABORATION STYLE ===
[Pick one:]
- "Ask me questions first, then proceed"
- "Show me 2-3 options, I'll choose the approach"
- "Provide a plan, wait for approval, then implement"
- "Checkpoint after each major step"
```

**Example:**
```
=== PROJECT CONTEXT ===
Project: Nodus Design System - Component Library
Tech Stack: React 18, TypeScript 5.3, styled-components
Standards: @DOCUMENTATION-STANDARDS.md @design-config.json

=== THE CHALLENGE ===
What I'm trying to accomplish:
Create a DataTable component with sorting, filtering, and virtualization
for handling 10k+ rows smoothly.

Why this matters:
We have 15+ inconsistent table implementations across the app.
This will standardize UX and improve performance.

Current blockers:
Current tables are slow with 1000+ rows and have accessibility issues.

=== REQUIREMENTS ===
Must Have:
- Virtual scrolling for 10k+ rows
- Column sorting and filtering
- WCAG 2.1 AA compliance
- TypeScript generics for type safety
- Mobile responsive

Must NOT Have:
- Any 'any' types in TypeScript
- External dependencies beyond react-virtual
- Built-in data fetching (should be agnostic)

=== CONSTRAINTS ===
Technical: Chrome/Firefox/Safari last 2 versions, <100ms initial render
Business: Need MVP in 2 weeks
Quality: 80%+ test coverage, full Storybook documentation

=== SUCCESS CRITERIA ===
This is complete when:
✓ Renders 10k rows with smooth scrolling
✓ Passes axe DevTools with zero violations
✓ Has complete API documentation and 7+ Storybook stories
✓ Migration guide written for existing tables

=== COLLABORATION STYLE ===
Show me the component API design for approval first,
then implement with checkpoints after each major feature.
```

---

## 2. ⚡ Quick Task (Simple & Fast)

**When to use:**
- Task is straightforward and focused
- You know exactly what you want
- No complex requirements or edge cases
- Just need it done quickly

**Don't use when:** Requirements are unclear or task is complex

```
@[relevant-files]

Task: [One clear sentence of what you need]

Requirements:
- [Must have 1]
- [Must have 2]
- [Must have 3]

Don't:
- [Avoid this]
- [Don't do this]

Follow: [@reference-file-or-pattern]
```

**Examples:**
```
@Button.tsx @design-config.json

Task: Add a "ghost" variant to our Button component

Requirements:
- Transparent background with border
- Uses primary color for border and text
- Hover state darkens the background slightly
- All existing props still work

Don't:
- Change existing variants
- Add new dependencies

Follow: @Button.tsx existing variant patterns
```

```
@utils/validation.ts

Task: Add email validation function

Requirements:
- Returns boolean
- Accepts optional "strict" mode for corporate emails
- TypeScript strict mode compliant

Don't:
- Use regex that allows invalid formats
- Add external dependencies

Follow: Other validators in this file
```

---

## 3. 💬 Interview Me (Exploratory / Unsure)

**When to use:**
- Not sure what the best approach is
- Want AI to help clarify requirements
- Exploring options before committing
- Problem is complex or unfamiliar

**Don't use when:** You know exactly what you need (use Quick Task or Big Boy)

```
@[relevant-context]

I want to [high-level goal].

I'm not sure about the best approach.

Interview me with 5-7 key questions about:
- Requirements and priorities
- Constraints and trade-offs
- [Other specific area you want questions about]

Then suggest 2-3 approaches with pros/cons.
```

**Alternative - Ultra Short Version:**
```
I need [X]. Interview me with 5 quick questions to get started right.
```

**Examples:**
```
@nodus-design-system/ @css-themes/

I want to add theme customization so users can override design tokens.

I'm not sure about the best approach.

Interview me with 7 key questions about:
- Scope of customization allowed
- Storage and performance
- Developer experience priorities
- TypeScript integration

Then suggest 2-3 approaches with pros/cons.
```

```
@ComponentFile.tsx

This component is slow when rendering lots of items.

Interview me with 5 questions to diagnose the issue,
then suggest solutions.
```

---

## 4. 🐛 Fix This (Debugging / Performance)

**When to use:**
- Something's broken or not working as expected
- Performance issues or errors
- Need to diagnose and fix a problem
- Want to understand what went wrong

**Don't use when:** Building something new (use Build This template)

```
@[problematic-file]

=== THE PROBLEM ===
What's happening:
[Current broken behavior]

What should happen:
[Expected behavior]

Error/symptoms:
[Error messages, performance metrics, symptoms]

=== CONTEXT ===
When it happens:
[Conditions, user actions, data that triggers it]

What I've tried:
- [Attempt 1] - [Result]
- [Attempt 2] - [Result]

=== WHAT I NEED ===
1. Root cause identification
2. Recommended fix with explanation
3. How to prevent this in future

=== CONSTRAINTS ===
- [Must maintain backward compatibility / Can't change API / etc.]
- [Performance target or other limits]
```

**Example:**
```
@DataTable.tsx @hooks/useVirtualScroll.ts

=== THE PROBLEM ===
What's happening:
Table scrolling is janky when we have 5000+ rows. 
Frame rate drops to ~15fps during scroll.

What should happen:
Smooth 60fps scrolling even with 10k rows

Error/symptoms:
- Chrome DevTools shows long tasks during scroll
- "Recalculating styles" takes 80-120ms
- Users complaining about lag

=== CONTEXT ===
When it happens:
- Only with 3000+ rows
- Worse when columns have complex cell renderers
- Fine in development, worse in production build

What I've tried:
- Added React.memo to cells - minimal improvement
- Tried smaller batch size - made it worse
- Reduced row height - helped slightly but not enough

=== WHAT I NEED ===
1. Root cause identification
2. Recommended fix with explanation
3. How to prevent this in future

=== CONSTRAINTS ===
- Can't change the public API (props)
- Must support custom cell renderers
- Target: 60fps with 10k rows
```

---

## 5. 🎨 Build This (Creating Something New)

**When to use:**
- Creating a new component, feature, or document
- Requirements are mostly clear
- Need implementation guidance
- Want it done right the first time

**Don't use when:** Fixing existing code (use Fix This) or requirements unclear (use Interview Me)

```
@[reference-files]

Build: [What you're creating - component/feature/doc/etc.]

=== REQUIREMENTS ===
Must have:
- [Core requirement 1]
- [Core requirement 2]
- [Core requirement 3]

Should have:
- [Nice to have 1]
- [Nice to have 2]

=== DESIGN/SPECS ===
[Key implementation details, design tokens, API shape, etc.]

=== DELIVERABLES ===
- [Implementation]
- [Tests / Documentation / Examples]
- [Other deliverables]

=== FOLLOW PATTERNS FROM ===
@[similar-file-or-pattern]

=== CONSTRAINTS ===
- [Constraint 1]
- [Constraint 2]
```

**Example:**
```
@design-config.json @Button.tsx @Modal.tsx

Build: Tooltip component

=== REQUIREMENTS ===
Must have:
- Appears on hover or focus
- Supports top/right/bottom/left positions
- Auto-repositions if near viewport edge
- WCAG 2.1 AA compliant
- TypeScript strict mode

Should have:
- Controlled and uncontrolled modes
- Custom delay before showing
- Arrow pointing to trigger

=== DESIGN/SPECS ===
- Use design tokens from design-config.json
- Max width: 250px
- Dark background with white text
- 8px padding, 4px border-radius
- z-index: 9999

=== DELIVERABLES ===
- Tooltip.tsx component
- TypeScript types
- 5+ usage examples
- Accessibility documentation
- Unit tests

=== FOLLOW PATTERNS FROM ===
@Button.tsx @Modal.tsx for component structure
@design-config.json for theming approach

=== CONSTRAINTS ===
- No external tooltip libraries
- Must work without JavaScript (graceful degradation)
- Bundle size: <5kb
```

---

## 🎯 Quick Decision Guide

**Start here:**

1. **Know exactly what you want + it's simple?**  
   → Use **Quick Task** ⚡

2. **Know what you want + it's complex/important?**  
   → Use **The Big Boy** 🚀

3. **Not sure what you need or best approach?**  
   → Use **Interview Me** 💬

4. **Something's broken or slow?**  
   → Use **Fix This** 🐛

5. **Building something new?**  
   → Use **Build This** 🎨

---

## 💡 Pro Tips

### Combine Templates
Mix sections from different templates if needed:
```
Build: New authentication system

[Use Build This structure]

But also: Interview me first about security requirements
```

### Iterate
Start with Interview Me, then use the answer to fill in Big Boy or Build This.

### Reference Files
Always use `@filename` to attach relevant files - it dramatically improves results.

### Be Specific About "Follow"
Point to specific files or patterns to match. Example:
```
Follow: @Button.tsx for component structure
Follow: @API-DOCUMENTATION-TEMPLATE.md for documentation style
```

### The "Must NOT Have" Section
This is powerful! Tell AI what to avoid:
```
Must NOT Have:
- Class components (use functional)
- External dependencies
- Any 'any' types
- Inline styles
```

---

## 📝 Customization Tips

These templates are starting points. Feel free to:
- **Add sections** that matter for your project
- **Remove sections** that don't apply
- **Save your own variations** for recurring tasks
- **Create project-specific versions** with pre-filled standards

---

## Version History

- **v2.0.0** (2025-10-19): Streamlined to essential 5 templates
- **v1.0.0** (2025-10-19): Initial collection (16 templates)

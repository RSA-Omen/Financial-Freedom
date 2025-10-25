# AI Prompting Guide

## Overview

This guide explores best practices and techniques for writing effective AI prompts, particularly in the context of software development, documentation, and design systems.

---

## Table of Contents

1. [Quick Start: Making AI's Job Easier](#quick-start-making-ais-job-easier)
2. [Premium Templates](#premium-templates)
   - [The "Above and Beyond" Template](#-the-above-and-beyond-template)
3. [Discovery Phase: The Question-First Approach](#discovery-phase-the-question-first-approach)
   - [Discovery Templates](#discovery-phase-template)
   - [The "Interview Me" One-Liner](#the-interview-me-one-liner)
   - [Hybrid Approach](#hybrid-approach-heres-what-i-know--ask-about-the-rest)
4. [Core Principles](#core-principles)
5. [Prompt Structure](#prompt-structure)
6. [Context Setting](#context-setting)
7. [Specificity and Clarity](#specificity-and-clarity)
8. [Examples and Patterns](#examples-and-patterns)
9. [Common Pitfalls](#common-pitfalls)
10. [Advanced Techniques](#advanced-techniques)

---

## Quick Start: Making AI's Job Easier

### What You're Already Doing Right ✅

- **Using `@folder/` or `@file` references**: This gives immediate context about what you're working with
- **Asking focused questions**: Starting a conversation with clear intent

### 10 Quick Wins to Level Up Your Prompts

#### 1. **State Your End Goal First**
Instead of: "Let's create a new .md file"  
Try: "I want to create a prompt engineering guide for our design system so the team can write better AI prompts"

#### 2. **Attach Relevant Files/Folders Explicitly**
✅ You did this! `@nodus-design-system/` gives me everything I need  
💡 For specific tasks, attach individual files: `@design-config.json` when working with that file

#### 3. **Tell Me What NOT to Do**
```
Create a component, but:
- Don't use class components
- Don't add external dependencies
- Don't include animations yet
```

#### 4. **Specify Your Preferred Style**
```
Write this documentation:
- Casual, developer-friendly tone
- Include emoji sparingly
- Code examples in TypeScript
- Keep it under 200 lines
```

#### 5. **Give Me a Reference Point**
```
Create a new template similar to API-DOCUMENTATION-TEMPLATE.md 
but for CLI tools instead of React components
```

#### 6. **Break Big Tasks into Conversations**
Instead of: "Build a complete design system"  
Try:
- Conversation 1: "Let's audit our current components"
- Conversation 2: "Create documentation for Button component"
- Conversation 3: "Generate TypeScript types for design tokens"

#### 7. **Use "Thinking Out Loud" Prompts**
```
I'm thinking about reorganizing our docs structure. 
Current issue: Hard to find API references.
Idea: Maybe separate guides from API docs?
What would you suggest?
```

#### 8. **Ask for Options Before Implementation**
```
I need to add dark mode support. 
Before we start coding, give me 3 different approaches 
with pros/cons for each.
```

#### 9. **Provide Success Criteria**
```
Create a validation hook that:
✓ Returns boolean for validity
✓ Includes helpful error messages
✓ Works with our form components
✓ Has TypeScript strict mode enabled
```

#### 10. **Iterate Explicitly**
```
That's good, but can you:
- Make error messages more specific
- Add JSDoc comments
- Include an example with async validation
```

---

### Context Shortcuts

#### Give Me These When Relevant:

**For Code Tasks:**
- Language/framework version
- Existing patterns you follow
- File structure preferences
- Naming conventions

**For Documentation:**
- Target audience (junior dev, senior, non-technical)
- Existing doc style (see DOCUMENTATION-STANDARDS.md)
- Length constraints
- Required sections

**For Design/Architecture:**
- Constraints (performance, browser support, etc.)
- Existing patterns to follow or avoid
- Scale considerations
- Integration points

---

### Real Examples from Your Project

#### ❌ Basic Prompt
```
Add a new theme
```

#### ✅ Enhanced Prompt
```
@css-themes/ @design-config.json

Add a new "high-contrast" theme to our CSS themes.
- Base it on the existing dark theme structure
- Follow the naming convention in design-config.json
- Ensure WCAG AAA contrast ratios
- Include all color tokens from the main theme
```

#### ❌ Basic Prompt
```
Fix the documentation
```

#### ✅ Enhanced Prompt
```
@DOCUMENTATION-STANDARDS.md @API-DOCUMENTATION-TEMPLATE.md

Review these docs and tell me:
1. What sections are missing per our standards?
2. Are code examples consistent?
3. Any unclear explanations?

Then let's fix the top 3 issues.
```

#### ❌ Basic Prompt
```
Help with this code
```

#### ✅ Enhanced Prompt
```
@ComponentFile.tsx

This component has performance issues when re-rendering.
Can you:
1. Identify unnecessary re-renders
2. Suggest React.memo or useMemo opportunities
3. Show before/after with explanations
```

---

### The "5 W's" Framework

Before writing a prompt, ask yourself:

1. **What** do I want created/changed/reviewed?
2. **Why** am I doing this? (helps me understand priorities)
3. **Where** does this fit? (files, folders, architecture)
4. **Who** is this for? (audience, users, team)
5. **When/Which** constraints apply? (deadlines, versions, standards)

---

### Pro Tips

#### Use Progressive Disclosure
Start broad, then get specific:
```
User: "I want to improve our documentation"
AI: [gives overview and suggestions]
User: "Let's focus on the API docs first"
AI: [provides API-specific recommendations]
User: "Perfect, let's start with the Button component"
```

#### Leverage "Batch Mode"
```
Let's do a documentation sprint. For each component I mention,
create full API docs following our template:

1. Button
2. Input  
3. Modal

Use design-config.json for type references.
```

#### Ask for Explanations
```
Create this function, and explain:
- Why you chose this approach
- Alternative approaches you considered
- Trade-offs of your solution
```

#### Use Checkpoints
```
Before we implement, show me:
1. File structure you'll create
2. Key functions/components
3. Dependencies needed

I'll review before we proceed.
```

---

### Quick Reference Card

**Copy-paste this template for better prompts:**

```
Context: [What am I working on? What's the current state?]

Goal: [What's the end result I want?]

Constraints: [Any limitations, standards, or requirements?]

Format: [How should the output look?]

References: [@files or patterns to follow]

Success looks like: [How do I know it's done right?]
```

---

## Premium Templates

### 🚀 The "Above and Beyond" Template

Use this for complex, high-stakes tasks where you want exceptional results:

```
=== PROJECT CONTEXT ===
Project: [Name and type of project]
Current Phase: [Planning/Development/Refactoring/Documentation/etc.]
Tech Stack: [Languages, frameworks, tools, versions]
Team Size: [Solo/Small team/Large team]
Standards: [@reference files or describe coding standards]

=== THE CHALLENGE ===
What I'm trying to accomplish:
[Detailed description of the goal]

Why this matters:
[Business value, user impact, or technical importance]

Current blockers/pain points:
[What's not working or needs improvement]

=== REQUIREMENTS ===
Must Have:
- [Critical requirement 1]
- [Critical requirement 2]
- [Critical requirement 3]

Should Have:
- [Important but not critical 1]
- [Important but not critical 2]

Nice to Have:
- [Optional enhancement 1]
- [Optional enhancement 2]

Must NOT Have:
- [Anti-pattern or approach to avoid 1]
- [Anti-pattern or approach to avoid 2]

=== CONSTRAINTS ===
Technical:
- [Browser support, performance targets, etc.]

Business:
- [Timeline, budget, dependencies]

Quality:
- [Testing requirements, accessibility, security]

=== REFERENCES ===
Files to follow: [@file1.ext @file2.ext]
Patterns to match: [Describe or reference existing patterns]
External resources: [Links or documentation references]

=== SUCCESS CRITERIA ===
This is complete when:
✓ [Measurable outcome 1]
✓ [Measurable outcome 2]
✓ [Measurable outcome 3]

Quality markers:
✓ [How to know it's done well]
✓ [What good looks like]

=== DELIVERY PREFERENCES ===
Output format: [Code/Docs/Analysis/Recommendation/etc.]
Explanation level: [Minimal/Moderate/Detailed]
Code style: [Verbose with comments/Clean and concise/etc.]
Examples needed: [Yes/No, how many, what type]

=== COLLABORATION STYLE ===
[Choose one or customize:]
- "Ask me questions first, then proceed"
- "Show me options, I'll choose the approach"
- "Provide a plan, wait for approval, then implement"
- "Just do it, I trust your judgment"
- "Checkpoint after each major step"
```

#### Example Using the Above & Beyond Template

```
=== PROJECT CONTEXT ===
Project: Nodus Design System - Component Library
Current Phase: Expanding component coverage
Tech Stack: React 18, TypeScript 5.3, styled-components, Storybook
Team Size: 3 developers
Standards: @DOCUMENTATION-STANDARDS.md @API-DOCUMENTATION-TEMPLATE.md

=== THE CHALLENGE ===
What I'm trying to accomplish:
Create a production-ready DataTable component that handles large datasets,
sorting, filtering, and pagination while maintaining our design system's
look and feel.

Why this matters:
Our main app has 15+ tables that are all custom-built inconsistently.
This component will standardize the experience and save development time.

Current blockers/pain points:
- Existing table implementations are slow with 1000+ rows
- Inconsistent sorting/filtering UX across the app
- No mobile-responsive table pattern
- Accessibility issues with current implementations

=== REQUIREMENTS ===
Must Have:
- Virtual scrolling for 10k+ rows
- Column sorting (client and server-side)
- Column filtering with type-aware filters
- Responsive design (mobile stacks or scrolls)
- WCAG 2.1 AA compliance
- TypeScript generics for type-safe data

Should Have:
- Column resizing
- Column reordering (drag-drop)
- Row selection (single/multi)
- Export to CSV
- Customizable cell renderers

Nice to Have:
- Column pinning
- Expandable rows
- Inline editing
- Save/restore table state

Must NOT Have:
- External dependencies beyond react-virtual (approved)
- Inline styles (use styled-components)
- Any usage of 'any' type in TypeScript
- Built-in data fetching (should be agnostic)

=== CONSTRAINTS ===
Technical:
- Must work in Chrome, Firefox, Safari (last 2 versions)
- Initial render under 100ms for 1000 rows
- Bundle size under 50kb gzipped
- No layout shift during interactions

Business:
- Need MVP in 2 weeks for stakeholder demo
- Will be used in 5+ major features

Quality:
- 80%+ test coverage
- Full Storybook stories with controls
- Complete API documentation
- Accessibility audit passed

=== REFERENCES ===
Files to follow: @design-config.json @Button.tsx @Modal.tsx
Patterns to match: Our existing component structure and prop naming
External resources: https://tanstack.com/table for API inspiration

=== SUCCESS CRITERIA ===
This is complete when:
✓ Can render 10,000 rows with smooth scrolling
✓ All sorting/filtering works client and server side
✓ Passes axe DevTools with zero violations
✓ Has 10+ Storybook stories covering main use cases
✓ TypeScript types are 100% inferred (no manual type annotations needed by users)
✓ Documentation includes migration guide from old tables

Quality markers:
✓ Code review approved by lead dev
✓ QA testing passed on all supported browsers
✓ Performance budget met (Lighthouse score 90+)
✓ Developer experience is smooth (easy to use in 5 minutes)

=== DELIVERY PREFERENCES ===
Output format: Component code + tests + stories + documentation
Explanation level: Detailed for architecture decisions, concise for obvious code
Code style: Clean and concise, JSDoc for public APIs only
Examples needed: Yes - 5-7 progressive examples from basic to advanced

=== COLLABORATION STYLE ===
Ask me questions first about any ambiguous requirements,
then show me the component architecture and API design for approval,
then implement step-by-step with checkpoints.
```

---

## Discovery Phase: The Question-First Approach

### The Power of "Ask Me First"

Instead of giving all context upfront, invite the AI to interview you. This is perfect when:
- You're not sure what details matter
- The problem is complex or unclear
- You want to think through requirements collaboratively
- You're exploring options

### Discovery Phase Template

```
=== DISCOVERY PHASE PROMPT ===

I want to [high-level goal].

Before you start, ask me questions to understand:
- What I'm really trying to achieve
- What constraints or preferences I have
- What context you need
- What approach would work best

Ask 5-10 clarifying questions, then we'll proceed based on my answers.
```

### Enhanced Discovery Template

```
=== COLLABORATIVE DISCOVERY ===

Project: [Project name or description]
Goal: [What I want to accomplish]
Context: [@relevant files or folders]

I'm not 100% sure about the best approach yet.

Please ask me questions about:
1. Requirements - What's critical vs. nice-to-have?
2. Constraints - Technical, timeline, quality?
3. Existing patterns - What should this match or avoid?
4. Trade-offs - What am I willing to sacrifice?
5. Success metrics - How will we know it's good?
6. [Any other specific area you want questions about]

Limit to your top 7-10 most important questions.
After I answer, propose 2-3 approaches and we'll pick one together.
```

### Discovery Phase Examples

#### Example 1: Architecture Decision

```
@nodus-design-system/ 

I want to add theme customization so users can override our design tokens.

Before we dive in, ask me questions to understand:
- How much customization should be allowed
- Where themes should be stored/loaded from
- Performance requirements
- Developer experience priorities
- Integration with existing components

Ask me 5-7 key questions to clarify the requirements.
```

**Expected AI Response:**
```
Great! Let me ask some clarifying questions:

1. **Scope of customization**: Should users be able to override:
   - Only colors?
   - Colors + typography?
   - All design tokens including spacing, borders, shadows?

2. **Theme switching**: Do you need:
   - Runtime theme switching (user clicks a button)?
   - Build-time theme selection only?
   - Both?

3. **Storage**: Where should custom themes live:
   - In the consuming app's code?
   - In browser localStorage/sessionStorage?
   - In a database/API?
   - Configuration files?

4. **Validation**: Should we:
   - Strictly validate all tokens against a schema?
   - Allow any values and warn on invalid ones?
   - No validation, trust the developer?

5. **TypeScript support**: Should custom themes:
   - Get full type inference and autocomplete?
   - Be loosely typed?

6. **Bundle size concern**: Is it acceptable if this adds:
   - < 5kb to bundle
   - < 15kb to bundle
   - Size doesn't matter much

7. **Migration**: Do existing components need to:
   - Work with zero changes?
   - Require minor updates?
   - Can we make breaking changes?

Once I understand these, I can recommend the best approach!
```

#### Example 2: Performance Optimization

```
@ComponentFile.tsx

This component is slow when rendering lots of items.

I'm not sure what the root cause is or the best fix.

Ask me questions to help diagnose:
- How it's being used
- What performance is acceptable
- What constraints we have
- What data patterns exist

Then suggest 2-3 solutions ranked by impact.
```

#### Example 3: Documentation Structure

```
@nodus-design-system/

Our docs are getting messy. I want to reorganize them.

Ask me questions about:
- Who uses the docs (audience)
- What pain points exist now
- What needs to be easy to find
- How the team prefers to navigate
- Any tools/generators we should use

Then propose a new structure.
```

---

### The "Interview Me" One-Liner

For quick tasks where you want the AI to take the lead:

```
I need [X]. Interview me with 5 quick questions to get started right.
```

Examples:
```
I need a new component. Interview me with 5 quick questions to get started right.
```

```
I need to refactor this code. Interview me with 5 quick questions to get started right.
```

```
I need better error handling. Interview me with 5 quick questions to get started right.
```

---

### Hybrid Approach: "Here's What I Know + Ask About The Rest"

Best of both worlds - give context you have, request questions for what you don't:

```
=== WHAT I KNOW ===
[Provide clear details here]

=== WHAT I'M UNSURE ABOUT ===
[List areas of uncertainty]

Please ask questions about the uncertain areas, then we'll proceed.
```

#### Example:

```
@design-config.json @css-themes/

=== WHAT I KNOW ===
- I want to add a "compact" mode for denser UIs
- It should reduce spacing/padding across all components
- Need both CSS and design tokens updated
- Should be a toggle like dark mode

=== WHAT I'M UNSURE ABOUT ===
- How much to reduce spacing (50%? 75%? variable?)
- Whether to affect font sizes too
- How to handle components that are already tight
- Testing strategy for visual regression
- Whether to support compact + dark mode combination

Ask me clarifying questions about these uncertain areas,
then propose an implementation approach.
```

---

## Core Principles

### 1. Be Specific
- Clearly define what you want
- Specify format, style, and constraints
- Include desired output structure

### 2. Provide Context
- Share relevant background information
- Explain the use case or goal
- Reference existing patterns or standards

### 3. Use Examples
- Show desired output format
- Demonstrate edge cases
- Illustrate patterns to follow or avoid

### 4. Iterate and Refine
- Start broad, then narrow down
- Build on previous responses
- Adjust based on results

---

## Prompt Structure

### Basic Template

```
[Context]
Describe the situation, project, or domain

[Task]
Clearly state what you need

[Constraints]
List any limitations, requirements, or preferences

[Format]
Specify desired output structure

[Examples] (optional)
Provide examples if helpful
```

### Example Prompt

```
Context: I'm working on a design system documentation project.

Task: Create a comprehensive API documentation template for React components.

Constraints:
- Must follow our existing documentation standards
- Include TypeScript type definitions
- Support both props and hooks documentation
- Maximum 500 lines

Format:
- Markdown with clear sections
- Code examples in TypeScript
- Table for props listing

Examples: See API-DOCUMENTATION-TEMPLATE.md for style reference
```

---

## Context Setting

### What to Include

1. **Project Type**: Web app, library, CLI tool, etc.
2. **Technology Stack**: Languages, frameworks, tools
3. **Existing Patterns**: Reference files or conventions
4. **Audience**: Who will use/read this?
5. **Constraints**: Technical limitations, standards to follow

### Good Context Example

```
I'm building a React component library using TypeScript. 
We follow Material Design principles and use styled-components. 
Our team prefers functional components with hooks over class components.
Documentation should be accessible to junior developers.
```

### Poor Context Example

```
I need help with React.
```

---

## Specificity and Clarity

### Be Explicit About

- **Input/Output formats**: JSON, markdown, code, etc.
- **Scope**: Single file, multiple files, specific sections
- **Style**: Formal, casual, technical level
- **Length**: Word count, line limits, detail level
- **Standards**: Coding conventions, naming patterns

### Specificity Examples

❌ **Too Vague**: "Help me with my code"

✅ **Specific**: "Review this TypeScript function for type safety issues and suggest improvements following functional programming principles"

❌ **Too Vague**: "Write documentation"

✅ **Specific**: "Create JSDoc comments for this API endpoint including parameter types, return values, error cases, and a usage example"

---

## Examples and Patterns

### Using Examples Effectively

1. **Show, Don't Just Tell**
   ```
   Format the output like this:
   ## Component Name
   **Status**: Stable
   **Since**: v1.2.0
   ```

2. **Provide Multiple Examples**
   - Show edge cases
   - Demonstrate variations
   - Include both good and bad examples

3. **Reference Existing Work**
   ```
   Follow the same pattern as used in DOCUMENTATION-STANDARDS.md
   ```

---

## Common Pitfalls

### 1. Assumption Overload
❌ Assuming the AI knows your project details  
✅ Explicitly state important context

### 2. Ambiguous Instructions
❌ "Make it better"  
✅ "Improve error handling by adding try-catch blocks and meaningful error messages"

### 3. Multiple Disconnected Requests
❌ "Fix bugs, add tests, update docs, and refactor"  
✅ Break into separate, focused prompts

### 4. Missing Constraints
❌ Not specifying limits or requirements  
✅ "Keep under 100 lines, use only standard library"

### 5. No Success Criteria
❌ Unclear what "done" looks like  
✅ "Should pass all TypeScript strict checks and include 3 unit tests"

---

## Advanced Techniques

### 1. Chain of Thought Prompting
Ask the AI to explain its reasoning:
```
Explain your approach step-by-step before providing the solution.
```

### 2. Role Assignment
```
Act as a senior software architect reviewing this design.
```

### 3. Iterative Refinement
```
First, outline the structure.
Then, we'll fill in each section one by one.
```

### 4. Constraint-Based Generation
```
Create a function that:
- Takes no more than 3 parameters
- Returns a Promise
- Has no side effects
- Includes full TypeScript types
```

### 5. Template-Based Prompting
```
Using this template: [template]
Generate content for: [specific case]
```

### 6. Meta-Prompting
Ask for help creating better prompts:
```
Help me write a better prompt to accomplish [goal].
What information would you need to provide the best result?
```

---

## Practical Examples for This Project

### Example 1: Component Documentation
```
Create documentation for a Button component following our API documentation template.
Include:
- Component props with TypeScript types
- Usage examples for primary, secondary, and disabled states
- Accessibility considerations
- Integration with our design tokens from design-config.json
```

### Example 2: Design System Gap Analysis
```
Review our current design system structure and identify:
- Missing components compared to Material Design
- Inconsistencies in naming conventions
- Gaps in documentation coverage
- Recommendations prioritized by impact

Format as markdown following NODUS-GAPS-TEMPLATE.md
```

### Example 3: Code Generation
```
Generate a React Hook for form validation that:
- Follows our Python expertise patterns (if applicable to TS/JS)
- Uses TypeScript strict mode
- Includes JSDoc comments
- Returns validation state and error messages
- Supports async validation
- Has example usage
```

---

## Tips for Better Results

1. **Start with "Why"**: Explain the purpose before the task
2. **Be Conversational**: Natural language works well
3. **Ask for Alternatives**: "Provide 3 different approaches"
4. **Request Explanations**: "Explain trade-offs of each approach"
5. **Specify What to Avoid**: List anti-patterns or unwanted solutions
6. **Use Checkpoints**: Break large tasks into reviewable steps
7. **Leverage Existing Assets**: Reference files like design-config.json

---

## Practice Exercises

Try crafting prompts for these scenarios:

1. **Scenario**: Need to update CHANGELOG.md with new features
   - What context is needed?
   - What format should be specified?
   - What examples would help?

2. **Scenario**: Creating a new CSS theme variant
   - What existing files should be referenced?
   - What constraints matter?
   - How to ensure consistency?

3. **Scenario**: Reviewing documentation standards
   - What perspective should the AI take?
   - What criteria should guide the review?
   - How to structure the feedback?

---

## Resources and Further Reading

- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Library](https://docs.anthropic.com/claude/prompt-library)

---

## Version History

- **v1.0.0** (2025-10-19): Initial guide creation

---

## Contributing

This is a living document. As you discover effective prompting patterns, add them here with examples and context.



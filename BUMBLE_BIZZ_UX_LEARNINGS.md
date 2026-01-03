# UI/UX Learnings from Bumble Bizz

**Research Date:** January 3, 2026
**Purpose:** Apply proven patterns from Bumble Bizz to improve our partnership matching UX

---

## 📊 Research Summary

Bumble Bizz has **100M+ users** across all Bumble modes and showed **50% better retention** when users engage with multiple modes. Here's what makes their UX successful:

**Sources:**
- [Bumble Bizz Profile Best Practices](https://bumble.com/en/the-buzz/bumble-bizz-profile-best-practices)
- [Medium: UI/UX Comparison](https://medium.com/design-bootcamp/decoding-ui-ux-quick-comparison-of-tinder-and-bumble-9a3cb2b76f28)
- [IXD@Pratt Design Critique](https://ixd.prattsi.org/2019/09/design-critique-bumble-ios-app/)
- [Neo Interaction: User Engagement Study](https://www.neointeraction.com/post/how-bumble-s-diverse-connection-modes-boost-user-engagement-and-retention)

---

## 🎯 Key UI/UX Patterns to Apply

### 1. Multi-Card Profile System ⭐⭐⭐

**Bumble Bizz Pattern:**
- 6 swipeable cards per profile
- Card 1: Professional headshot
- Cards 2-4: Work samples (projects, logos, designs)
- Card 5: Workspace/environment (personality)
- Card 6: Personal interests/hobbies

**Why it works:**
- Tells a story (not just data dump)
- Reveals personality gradually
- More engaging than scrolling
- Mimics flipping through a portfolio

**Our Current:** Single scrollable card with all info in one view

**Recommended Implementation:**

```typescript
interface PartnerCard {
  type: "logo" | "metrics" | "team" | "tech" | "traction" | "personality";
  content: React.ReactNode;
}

const partnerCards: PartnerCard[] = [
  {
    type: "logo",
    content: (
      // Large logo + name + category + match score
      // Takes up 90% of screen (Bumble's rule)
    ),
  },
  {
    type: "metrics",
    content: (
      // KEY METRICS CARD
      // TVL, users, revenue - big numbers, visual charts
    ),
  },
  {
    type: "team",
    content: (
      // TEAM CARD
      // GitHub activity, contributor count, team health score
    ),
  },
  {
    type: "tech",
    content: (
      // TECH STACK CARD
      // Chain, tech stack, integrations
    ),
  },
  {
    type: "traction",
    content: (
      // TRACTION CARD
      // User growth chart, Twitter followers, GitHub stars
    ),
  },
  {
    type: "personality",
    content: (
      // WHY PARTNER CARD
      // AI-generated synergy description
      // Projected impact (runway, revenue, users)
      // Partnership type
    ),
  },
];
```

**Implementation Priority:** HIGH - This is the biggest UX improvement

---

### 2. 90/10 Screen Real Estate Rule ⭐⭐⭐

**Bumble Bizz Pattern:**
- 90% of screen: Visual content (photos)
- 10% of screen: Text (name + short bio)

**Why it works:**
- Instant visual impression
- Reduces cognitive load
- Mobile-optimized (thumb-friendly)
- Matches how humans process info (visual first)

**Our Current:** ~50/50 split between logo and text

**Recommended Changes:**

**First Card (Logo Card):**
```tsx
<div className="h-full flex flex-col">
  {/* 90% - Large visual */}
  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
    <Image
      src={partner.logo}
      alt={partner.name}
      width={200}
      height={200}
      className="rounded-2xl shadow-2xl"
    />
  </div>

  {/* 10% - Minimal info */}
  <div className="p-6 bg-card">
    <h2 className="text-2xl font-bold">{partner.name}</h2>
    <p className="text-sm text-muted-foreground">{partner.category}</p>
    <div className="mt-2 flex items-center gap-2">
      <Badge>{matchScore} Match</Badge>
      <span className="text-xs text-muted-foreground">
        Swipe for more →
      </span>
    </div>
  </div>
</div>
```

**Other Cards:** Can have more text (metrics, descriptions) but still lead with visuals

**Implementation Priority:** HIGH

---

### 3. Visual Swipe Feedback ⭐⭐⭐

**Bumble Bizz Pattern:**
- Half-transparent ✓ (green check) when swiping right
- Half-transparent ✗ (red cross) when swiping left
- Appears over the card during drag
- Increases in opacity as user drags further

**Why it works:**
- Instant visual feedback
- Confirms user intent before release
- Reduces accidental swipes
- Makes interaction feel responsive

**Our Current:** No visual feedback during drag, only motion

**Recommended Implementation:**

```tsx
// In PartnerDiscovery component
const dragOpacity = useTransform(
  x,
  [-100, 0, 100],
  [1, 0, 1]
);

// Add overlay to card
<motion.div
  style={{ x, rotate, opacity }}
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={handleDragEnd}
>
  {/* Card content */}
  <PartnerCard match={currentMatch} />

  {/* Swipe indicators - ADD THIS */}
  <motion.div
    className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-2xl pointer-events-none"
    style={{
      opacity: useTransform(x, [-200, -50, 0], [1, 0.5, 0]),
    }}
  >
    <X className="h-32 w-32 text-red-500" strokeWidth={3} />
  </motion.div>

  <motion.div
    className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl pointer-events-none"
    style={{
      opacity: useTransform(x, [0, 50, 200], [0, 0.5, 1]),
    }}
  >
    <Heart className="h-32 w-32 text-green-500" strokeWidth={3} />
  </motion.div>

  {/* Super Like indicator (swipe up) */}
  <motion.div
    className="absolute inset-0 flex items-center justify-center bg-blue-500/20 rounded-2xl pointer-events-none"
    style={{
      opacity: useTransform(y, [-200, -50, 0], [1, 0.5, 0]),
    }}
  >
    <Star className="h-32 w-32 text-blue-500 fill-blue-500" strokeWidth={3} />
  </motion.div>
</motion.div>
```

**Implementation Priority:** MEDIUM-HIGH - Big UX improvement

---

### 4. Mode Switching for Different Partnership Types ⭐⭐

**Bumble Bizz Pattern:**
- Tap logo at top to switch between Date/BFF/Bizz
- Each mode has different profile prompts
- Separate match queues per mode
- 50% better retention when users use multiple modes

**Why it works:**
- Different contexts need different information
- Reduces decision fatigue (focused intent)
- Increases session time (explore multiple modes)
- Better matching quality

**Our Current:** Single discovery queue

**Recommended Implementation:**

```tsx
type PartnershipMode = "integration" | "acquisition" | "comarketing" | "investment";

// Add mode selector to header
<header className="...">
  <div className="flex items-center gap-2">
    <Button
      variant={mode === "integration" ? "default" : "outline"}
      onClick={() => setMode("integration")}
    >
      Integration
    </Button>
    <Button
      variant={mode === "acquisition" ? "default" : "outline"}
      onClick={() => setMode("acquisition")}
    >
      Acquisition
    </Button>
    <Button
      variant={mode === "comarketing" ? "default" : "outline"}
      onClick={() => setMode("comarketing")}
    >
      Co-Marketing
    </Button>
    <Button
      variant={mode === "investment" ? "default" : "outline"}
      onClick={() => setMode("investment")}
    >
      Investment
    </Button>
  </div>
</header>

// Filter matches by mode
const filteredMatches = matches.filter(m =>
  m.partnershipType === mode
);
```

**Implementation Priority:** MEDIUM - Good for Phase 2

---

### 5. Personality Beyond Data ⭐⭐

**Bumble Bizz Pattern:**
- Workspace photos (shows environment)
- Hobby/interest cards (humanizes profile)
- Quotes or values (culture fit)

**Why it works:**
- B2B partnerships are still P2P (person-to-person)
- Culture fit matters for success
- Makes profiles memorable
- Reduces "just another company" feeling

**Our Current:** Pure metrics and AI descriptions

**Recommended Additions:**

For company profiles, add optional "personality" fields:
- **Team culture:** Photos from team events, office, meetups
- **Values:** Company mission/vision statements
- **Achievements:** Major milestones (not just metrics)
- **Testimonials:** Quotes from users or partners

**Implementation Priority:** LOW - Nice to have, not critical

---

### 6. Design System Improvements ⭐⭐

**Bumble Bizz Pattern:**
- Clean, modern design with pleasing color scheme
- Intuitive navigation
- Responsive, well-organized menus
- Readable text with good hierarchy

**Critiques from users:**
- "Tactless pop-ups" - avoid interrupting flow
- "Frequently cut-off text" - ensure proper truncation
- "Obtuse color-coded match system" - make everything obvious

**Our Current:** Good foundation with shadcn/ui

**Recommended Improvements:**

```tsx
// More whitespace
<div className="p-8 space-y-6">  // was p-6 space-y-4

// Bolder typography for key info
<h2 className="text-3xl font-bold">  // was text-2xl

// Clearer hierarchy
<div className="space-y-8">  // Group related sections
  <section>
    <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
      Metrics
    </h3>
    {/* Content */}
  </section>
</div>

// Better color usage
// Green = positive/match
// Red = negative/pass
// Blue = special/super like
// No other colors to avoid confusion
```

**Implementation Priority:** LOW-MEDIUM - Continuous improvement

---

## 🚀 Implementation Roadmap

### Phase 1: Critical UX Improvements (1-2 days)

1. **Add visual swipe feedback** (✗ and ✓ overlays)
   - Impact: HIGH
   - Effort: LOW
   - Files: `partner-discovery.tsx`

2. **Implement 90/10 rule for first card**
   - Impact: HIGH
   - Effort: MEDIUM
   - Files: `partner-discovery.tsx` (PartnerCard component)

3. **Add multi-card system** (6 cards per profile)
   - Impact: VERY HIGH
   - Effort: MEDIUM-HIGH
   - Files: `partner-discovery.tsx`, new `partner-card-carousel.tsx`

### Phase 2: Enhanced Features (2-3 days)

4. **Add partnership mode switching**
   - Impact: MEDIUM-HIGH
   - Effort: MEDIUM
   - Files: `partner-discovery.tsx`, API updates

5. **Design system polish**
   - Impact: MEDIUM
   - Effort: LOW-MEDIUM
   - Files: Multiple components, update shadcn theme

### Phase 3: Personality Features (Future)

6. **Add team/culture cards**
   - Impact: MEDIUM
   - Effort: HIGH (need new data sources)
   - Files: Database schema, profile claiming, cards

---

## 📐 Specific Design Specs

### Card Dimensions
```css
.partner-card {
  aspect-ratio: 3/4;        /* Bumble's standard */
  max-height: 600px;        /* Fits most screens */
  border-radius: 16px;      /* 2xl in Tailwind */
  overflow: hidden;
}
```

### Animation Timings
```javascript
const spring = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

const swipeVelocity = 500;  // pixels/second threshold
```

### Color Palette (Match Bumble's Psychology)
```css
--swipe-pass: hsl(0, 70%, 50%);      /* Red - clear rejection */
--swipe-like: hsl(140, 70%, 45%);    /* Green - positive */
--swipe-super: hsl(220, 90%, 56%);   /* Blue - special */
--match-gold: hsl(45, 90%, 55%);     /* Gold - celebration */
```

### Typography Hierarchy
```css
.card-title {
  font-size: 2rem;          /* 32px */
  font-weight: 700;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 0.875rem;      /* 14px */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-body {
  font-size: 1rem;          /* 16px */
  line-height: 1.6;
}
```

---

## 🎯 Success Metrics to Track

Once implemented, measure:

1. **Swipe completion rate**: % of users who swipe through 10+ matches
2. **Accidental swipes**: Track undo requests (should decrease with visual feedback)
3. **Card engagement**: Which cards get viewed most (track carousel position)
4. **Mode switching**: % of users who try multiple partnership modes
5. **Session duration**: Time spent swiping (should increase with multi-card)

---

## 💡 Key Takeaways

1. **Visual > Text**: Lead with large visuals, minimize initial text
2. **Feedback is crucial**: Users need to see what their gesture will do
3. **Tell a story**: Multiple cards create narrative (not data dump)
4. **Context matters**: Different modes for different partnership intents
5. **Mobile-first**: Design for thumb-friendly, one-handed use

---

## 🔗 Additional Resources

- [Bumble Bizz Profile Best Practices](https://bumble.com/en/the-buzz/bumble-bizz-profile-best-practices)
- [Figma: Bumble UI Kit](https://www.figma.com/community/file/1429553897830419251/bumble-free-ui-kit-by-marvilo)
- [Dribbble: Bumble Bizz Redesigns](https://dribbble.com/tags/bumble)
- [Behance: Bumble Bizz Redesign](https://www.behance.net/gallery/82191391/Bumble-Bizz-Redesign-Adobe-Live)
- [Mobbin: Bumble Screenshots](https://mobbin.com/apps/bumble-ios-709938b1-f504-4596-88c5-32a4c87548a1)

---

**Next Steps:** Review this doc, prioritize improvements, and implement Phase 1 changes to significantly boost UX quality.

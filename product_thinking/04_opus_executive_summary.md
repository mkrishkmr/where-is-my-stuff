# Where Is My Stuff: Architecture Summary & Judge Pitch

## One-Liner
**Inventory apps ask you to be a librarian. Where Is My Stuff asks you to take a photo.**

## The 4-Pillar Architecture

### 1. Effortless Capture: *Write path*
**Flow:** Photo → 1-tap room pill → 1-tap container pill → AI auto-tags in ≤3s
- **Input cost:** 2 taps, 0 typed fields
- **Replaces:** 60-second metadata forms
- **Design principle:** Location comes from the human; identity comes from the model. Users never type item names, categories, or descriptions.

### 2. Humanlike Recall: *Read path*
**Flow:** Natural query → semantic match against AI-generated tags → plain-English answer + photo proof
- **Example:** *"black cord for laptop to tv"* → *"HDMI cable, Living Room → TV cabinet → left drawer"* + photo
- **Replaces:** Exact-name
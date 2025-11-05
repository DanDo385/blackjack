# Alert/Toast Component Consolidation Summary

## Decision Made
**Removed the `alerts/` directory entirely** and kept all active alert components at the `components/` root level.

## Rationale
After analyzing the codebase, I found:

1. **The `alerts/` directory contained only ONE file**: `BetAgainToast.tsx`
2. **That file was completely unused** - no imports anywhere in the codebase
3. **It was a duplicate implementation** of functionality already provided by `Toasts.tsx`
4. **Another unused file existed**: `BetAgainPrompt.tsx` at the components root

The cleanest approach was to **remove unused code** rather than move working code around.

## Files Deleted

### 1. `frontend/components/alerts/BetAgainToast.tsx` (entire directory removed)
- **Status**: Unused duplicate implementation
- **What it did**: Provided a `showBetAgainToast()` function
- **Why deleted**: Never imported or used; duplicate of `showBetAgainPrompt()` in `Toasts.tsx`

### 2. `frontend/components/BetAgainPrompt.tsx`
- **Status**: Unused component
- **What it did**: React component for bet-again prompt UI
- **Why deleted**: Never imported or used anywhere in the codebase

### 3. `REORGANIZE_ALERTS_PROMPT.md`
- **Status**: Task prompt file
- **Why deleted**: Task completed, no longer needed

## Files Kept (Active Components)

### 1. `frontend/components/AlertBus.tsx` ✓
- **Used by**: `app/page.tsx`, `app/play/page.tsx`, `app/checkin/page.tsx`
- **Purpose**: Renders the `<Toaster>` container and handles wallet connection alerts
- **Status**: Active and essential

### 2. `frontend/components/Toasts.tsx` ✓
- **Used by**: `lib/alerts.ts`
- **Purpose**: Exports `showBetAgainPrompt()` function for win/loss bet-again prompts
- **Status**: Active and essential

### 3. `frontend/lib/alerts.ts` ✓
- **Purpose**: Central alert management with functions like:
  - `showWalletConnectedAlert()`
  - `showWinAlert()`
  - `showLossAlert()`
  - `showCashOutAlert()`
  - `showShufflingAlert()`
- **Status**: Active and essential

## Final Structure

```
frontend/
├── components/
│   ├── AlertBus.tsx          ✓ (renders Toaster container)
│   ├── Toasts.tsx            ✓ (bet-again toast logic)
│   └── [other components...]
└── lib/
    └── alerts.ts             ✓ (central alert functions)
```

## Verification

✓ No broken imports - verified with grep searches
✓ No references to deleted files exist in the codebase
✓ All active alert/toast functionality remains intact
✓ Zero import path updates required (only deleted unused code)

## Impact

- **Simplified structure**: Removed unnecessary nested directory
- **Removed duplication**: Eliminated duplicate bet-again implementations
- **Zero breaking changes**: No active code was modified
- **Easier maintenance**: Single clear location for all alert components

## What Was NOT Changed

- **No refactoring** of UI styles or behavior
- **No import updates** required (deleted files had no imports)
- **No functional changes** to existing alert system
- **No component moves** - kept working files in place

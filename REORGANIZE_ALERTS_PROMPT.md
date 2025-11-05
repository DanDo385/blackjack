# Reorganize Alert/Toast Components

## Task 1: Consolidate Alert/Toast Components

Move all components related to toasters, alerts, or notifications to the `frontend/components/alerts/` directory:

### Components to move:
1. **`frontend/components/AlertBus.tsx`** → `frontend/components/alerts/AlertBus.tsx`
   - Contains the Toaster component and wallet connection alert logic
   - Update all imports from `@/components/AlertBus` to `@/components/alerts/AlertBus`

2. **`frontend/components/Toasts.tsx`** → `frontend/components/alerts/Toasts.tsx`
   - Contains the `showBetAgainPrompt` function
   - Update import in `frontend/lib/alerts.ts` from `@/components/Toasts` to `@/components/alerts/Toasts`

3. **`frontend/components/BetAgainPrompt.tsx`** → `frontend/components/alerts/BetAgainPrompt.tsx`
   - Contains the BetAgainPrompt component
   - Update any imports that reference this component

### Files that import these components:
- `frontend/app/page.tsx` - imports AlertBus
- `frontend/app/play/page.tsx` - imports AlertBus
- `frontend/app/checkin/page.tsx` - imports AlertBus
- `frontend/lib/alerts.ts` - imports showBetAgainPrompt from Toasts.tsx

### Additional cleanup:
- Check `frontend/components/Providers.tsx` - it currently has a Toaster component. Since AlertBus already provides the Toaster, consider removing the duplicate Toaster from Providers.tsx and ensuring AlertBus is used instead (AlertBus should be imported and used in the app layout).

### Verification:
After moving, verify:
- All imports are updated correctly
- No broken references
- The Toaster is only rendered once (via AlertBus, not in Providers.tsx)
- All components compile without errors


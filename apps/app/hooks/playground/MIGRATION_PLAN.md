# Playground React Context Migration Plan

## ✅ Phase 1: Foundation (COMPLETED)
- [x] Analyzed current state management architecture
- [x] Designed granular 3-context architecture
- [x] Extended types.ts with comprehensive context types
- [x] Implemented PlaygroundProvider with 3 focused contexts
- [x] Validated TypeScript compilation
- [x] Created context validation component

## 🎯 Phase 2: Safe Migration Strategy

### Migration Order (Bottom-Up Approach)

**Priority 1: Leaf Components (No Dependencies)**
1. `CacheOptionsMenu` - Simple prop interface
2. `CleaningProcessorMenu` - Simple prop interface
3. `MetricsOptionsMenu` - Simple prop interface
4. `MarkdownOptionsMenu` - Simple prop interface

**Priority 2: Complex Option Components**
1. `LinkExtractionOptionsMenu` - Moderate complexity
2. `ContentFormatOptionsMenu` - High complexity, nested state

**Priority 3: Main Components**
1. `PlaygroundOptionsMenusToolbar` - Central orchestrator
2. `PlaygroundUrlInput` - Core functionality
3. `PlaygroundOperationClient` - Root component

### Migration Pattern for Each Component

#### Before (Current Pattern):
```tsx
interface CacheOptionsMenuProps {
  cacheOptions: CacheOptionsInput | undefined;
  onCacheOptionsChange: (cacheOptions: CacheOptionsInput) => void;
}

export function CacheOptionsMenu({ cacheOptions, onCacheOptionsChange }: CacheOptionsMenuProps) {
  // Component logic
}
```

#### After (Context Pattern):
```tsx
// No props needed for context-based components
export function CacheOptionsMenu() {
  const { currentQueryState } = usePlaygroundOptions();
  const cacheOptions = currentQueryState.getOption('cacheOptions');
  const onCacheOptionsChange = (cacheOptions: CacheOptionsInput) =>
    currentQueryState.setOptions({ cacheOptions });

  // Existing component logic unchanged
}
```

## 🚀 Phase 3: Step-by-Step Migration

### Step 1: Wrap Root Component (5 minutes)
```tsx
// In playground page or parent component
export function PlaygroundPage() {
  return (
    <PlaygroundProvider defaultOperation="getMarkdown" defaultUrl="">
      <PlaygroundOperationClient />
    </PlaygroundProvider>
  );
}
```

### Step 2: Migrate Simple Option Menus (15 minutes each)

**Template for simple components:**
```tsx
// Before: Props-based
function SimpleMenu({ options, onOptionsChange }: Props) { ... }

// After: Context-based
function SimpleMenu() {
  const { currentQueryState } = usePlaygroundOptions();
  const options = currentQueryState.getOption('specificOption');
  const onOptionsChange = (newOptions) => currentQueryState.setOptions({ specificOption: newOptions });
  // Rest of component unchanged
}
```

### Step 3: Migrate Complex Components (30 minutes each)

**For components with multiple dependencies:**
```tsx
// Before: Many props
function ComplexMenu({
  operation,
  getAnyOperationState,
  contentOptions,
  onContentChange,
  metadataOptions,
  onMetadataChange
}: ComplexProps) { ... }

// After: Selective context usage
function ComplexMenu() {
  const { selectedOperation } = usePlaygroundCore();
  const { currentQueryState, getAnyOperationState } = usePlaygroundOptions();

  const contentOptions = currentQueryState.getOption('contentOptions');
  const metadataOptions = currentQueryState.getOption('metadataOptions');

  const onContentChange = (options) => currentQueryState.setOptions({ contentOptions: options });
  const onMetadataChange = (options) => currentQueryState.setOptions({ metadataOptions: options });

  // Rest unchanged
}
```

### Step 4: Update Parent Components (20 minutes each)

**Remove prop drilling from parents:**
```tsx
// Before: Prop drilling nightmare
<PlaygroundOptionsMenusToolbar
  currentQueryState={currentQueryState}
  getAnyOperationState={getAnyOperationState}
  selectedOperation={selectedOperation}
  // ... 10+ props
>
  <ContentFormatOptionsMenu
    operation={selectedOperation}
    contentOptions={contentOptions}
    onContentChange={onContentChange}
    // ... 8+ props
  />
</PlaygroundOptionsMenusToolbar>

// After: Clean component tree
<PlaygroundOptionsMenusToolbar>
  <ContentFormatOptionsMenu />
</PlaygroundOptionsMenusToolbar>
```

## 🔧 Phase 4: Performance Optimization

### Use Granular Hooks for Performance
```tsx
// ❌ Causes re-renders on any state change
const allState = usePlayground();

// ✅ Only re-renders when core state changes
const { selectedOperation } = usePlaygroundCore();

// ✅ Only re-renders when options change
const { currentOptions } = usePlaygroundOptions();

// ✅ Actions never change - no re-renders
const { setRequestUrl } = usePlaygroundActions();

// ✅ Optimal: Select specific data
const selectedOp = usePlaygroundCoreSelector(state => state.selectedOperation);
```

## 📋 Phase 5: Validation & Testing

### Manual Testing Checklist
- [ ] All option menus work correctly
- [ ] URL parameter sync maintained
- [ ] Operation switching preserves state
- [ ] Reset to defaults functions work
- [ ] API calls execute properly
- [ ] No regression in functionality

### Component-by-Component Validation
```tsx
// Add temporary logging to verify context data
function ComponentUnderTest() {
  const core = usePlaygroundCore();
  const options = usePlaygroundOptions();
  const actions = usePlaygroundActions();

  console.log('Context validation:', { core, options, actions });

  // Rest of component
}
```

## ⚡ Performance Benefits After Migration

### Before Context:
- **15+ prop drilling levels** in complex components
- **Full re-renders** cascade through entire component tree
- **Type complexity** grows exponentially with each new option
- **Maintenance burden** when adding new features

### After Context:
- **Zero prop drilling** - direct context access
- **Granular re-renders** - only affected components update
- **Clean type interfaces** - context handles complexity
- **Easy feature additions** - just extend context

## 🎁 Developer Experience Improvements

### Cleaner Component APIs:
```tsx
// Before: Prop explosion
<ContentFormatOptionsMenu
  operation={selectedOperation}
  getAnyOperationState={getAnyOperationState}
  contentFormatOptions={contentFormatOptions}
  onContentFormatOptionsChange={onContentFormatOptionsChange}
  metadataOptions={metadataOptions}
  onMetadataOptionsChange={onMetadataOptionsChange}
  treeOptions={treeOptions}
  onTreeOptionsChange={onTreeOptionsChange}
  markdownOptions={markdownOptions}
  onMarkdownOptionsChange={onMarkdownOptionsChange}
/>

// After: Clean and simple
<ContentFormatOptionsMenu />
```

### Better TypeScript Experience:
```tsx
// Autocomplete and type safety without prop complexity
const { currentQueryState } = usePlaygroundOptions();
const cacheEnabled = currentQueryState.getOption('cacheOptions')?.enabled;
//    ^ Full TypeScript inference and autocomplete
```

## 🚨 Migration Safety Guidelines

1. **One Component at a Time** - Never migrate multiple components simultaneously
2. **Test After Each Migration** - Verify functionality before proceeding
3. **Keep Prop Interfaces** - Maintain backward compatibility during transition
4. **Use Context Gradually** - Start with context, keep props as fallback
5. **Validate Context Provider** - Ensure all components are wrapped properly

## 📝 Rollback Strategy

If issues arise, each component can be quickly reverted:
```tsx
// Easy rollback - just restore prop-based pattern
function ComponentWithIssues({
  restoredProp,
  onRestoredChange
}: RestoredProps) {
  // Temporarily revert to prop-based approach
}
```

The granular context design ensures partial rollbacks are possible without affecting other components.

---

**Estimated Total Migration Time: 2-3 hours**
**Risk Level: Low** (due to incremental approach and TypeScript validation)
**Rollback Time: < 30 minutes** (if needed)
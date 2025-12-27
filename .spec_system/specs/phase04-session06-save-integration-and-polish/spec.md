# Session Specification

**Session ID**: `phase04-session06-save-integration-and-polish`
**Phase**: 04 - Deep Research Frontend
**Status**: Not Started
**Created**: 2025-12-27

---

## 1. Session Overview

This session completes Phase 04 by integrating save-to-Items functionality for Perplexity and Gemini deep research results. Users will be able to save their research findings to the Items collection, enabling persistent storage and retrieval of AI-generated research content alongside existing Tavily search/extract/crawl/map results.

The implementation adds Save buttons to both result view components, creates mapper functions that transform API responses into the ItemCreate format, and extends the Items page to display and filter the new content types. This follows the established pattern from Phase 02 where save functionality was added for Tavily operations.

Completing this session delivers the full Deep Research Frontend MVP, enabling end-to-end workflows for both Perplexity and Gemini research with persistent storage.

---

## 2. Objectives

1. Enable users to save Perplexity deep research results to Items with proper metadata
2. Enable users to save Gemini deep research results to Items with proper metadata
3. Extend Items page to display and filter perplexity/gemini content types
4. Ensure consistent UX with loading states, toast notifications, and accessibility

---

## 3. Prerequisites

### Required Sessions
- [x] `phase04-session04-perplexity-page-and-components` - Provides PerplexityResultView component
- [x] `phase04-session05-gemini-page-and-components` - Provides GeminiResultView component
- [x] `phase02-session02-frontend-hooks-and-save-buttons` - Provides useSaveToItems hook
- [x] `phase02-session03-items-page-enhancements` - Provides ContentTypeBadge, ContentTypeFilter

### Required Tools/Knowledge
- Understanding of React Query mutations (useMutation pattern)
- Familiarity with ItemCreate schema structure
- Knowledge of existing mapper pattern in tavily-mappers.ts

### Environment Requirements
- Backend running with Perplexity and Gemini routes
- Database with Item model supporting content_type field

---

## 4. Scope

### In Scope (MVP)
- Save button on PerplexityResultView with loading/disabled states
- Save button on GeminiResultView with loading/disabled states
- Mapper function: mapPerplexityResultToItem()
- Mapper function: mapGeminiResultToItem()
- Update ContentTypeBadge with perplexity/gemini variants
- Update ContentTypeFilter with perplexity/gemini options
- Update items.tsx route search schema for new types
- Backend schema update to include 'perplexity' | 'gemini' in content_type enum
- Regenerate frontend SDK client after backend change
- Toast notifications for save success/failure
- Accessibility: keyboard navigation, button aria-labels

### Out of Scope (Deferred)
- SearchHistory database model - *Reason: Separate feature requiring new table*
- Rate limiting per user - *Reason: Backend infrastructure concern*
- Combined "Research Hub" page - *Reason: UX enhancement for future phase*
- Items detail view metadata rendering - *Reason: Can use existing JSON display*

---

## 5. Technical Approach

### Architecture
The implementation follows the established Phase 02 pattern:
1. Backend enum extension allows new content_type values
2. Frontend mapper functions transform API responses to ItemCreate
3. Save buttons use useSaveToItems hook with mapper output
4. Badge/filter components extended with new type configurations

### Design Patterns
- **Mapper Pattern**: Pure functions that transform API response types to ItemCreate format
- **Composition**: Save buttons composed into existing result view components
- **Discriminated Union**: Content type filtering uses TypeScript union types

### Technology Stack
- React 19 with TypeScript (strict mode)
- TanStack Query v5 (useMutation via useSaveToItems)
- Sonner for toast notifications
- shadcn/ui Button component
- Lucide React icons (Save, Loader2)

---

## 6. Deliverables

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `frontend/src/lib/deep-research-mappers.ts` | Mapper functions for Perplexity/Gemini to ItemCreate | ~80 |

### Files to Modify
| File | Changes | Est. Lines Changed |
|------|---------|-------------------|
| `backend/app/schemas/item.py` | Add 'perplexity', 'gemini' to ContentType enum | ~5 |
| `frontend/src/client/*` | Regenerated SDK (automated) | N/A |
| `frontend/src/components/Perplexity/PerplexityResultView.tsx` | Add Save button with useSaveToItems | ~25 |
| `frontend/src/components/Gemini/GeminiResultView.tsx` | Add Save button with useSaveToItems | ~25 |
| `frontend/src/components/Items/ContentTypeBadge.tsx` | Add perplexity/gemini badge variants | ~15 |
| `frontend/src/components/Items/ContentTypeFilter.tsx` | Add perplexity/gemini filter options | ~10 |
| `frontend/src/routes/_layout/items.tsx` | Update search schema with new types | ~5 |

---

## 7. Success Criteria

### Functional Requirements
- [ ] Save button appears on PerplexityResultView when results are displayed
- [ ] Save button appears on GeminiResultView when research is complete
- [ ] Clicking Save creates item with correct title, content, content_type, and metadata
- [ ] Toast shows "Saved to Items" on success
- [ ] Toast shows error message on failure
- [ ] Saved items appear in Items page table
- [ ] Items page filter includes "Perplexity" and "Gemini" options
- [ ] Filtering by perplexity/gemini returns correct items
- [ ] Type badges display with distinct colors for perplexity/gemini

### Testing Requirements
- [ ] Manual testing: complete Perplexity research, save, verify in Items
- [ ] Manual testing: complete Gemini research, save, verify in Items
- [ ] Manual testing: filter Items by each content type

### Quality Gates
- [ ] All files ASCII-encoded
- [ ] Unix LF line endings
- [ ] No TypeScript errors (npm run typecheck)
- [ ] No lint errors (npm run lint)
- [ ] Code follows project conventions (CONVENTIONS.md)

---

## 8. Implementation Notes

### Key Considerations
- Perplexity response has citations array and search_results; store in item_metadata
- Gemini response has outputs array with thinking_summary; extract main content, store metadata
- Save button should be disabled while save mutation is pending
- Save button should show loading spinner during mutation
- Gemini Save button should only enable when status === "COMPLETED"

### Potential Challenges
- **Different response structures**: Perplexity uses choices[0].message.content, Gemini uses outputs array - *Mitigation: Mapper functions abstract these differences*
- **Large content size**: Gemini outputs may be very long - *Mitigation: Content stored as-is; DB handles large text*
- **SDK regeneration**: Must run after backend enum update - *Mitigation: Sequential task order ensures this*

### Relevant Considerations
- [P02] **Item model extended**: Adding 'perplexity' and 'gemini' to content_type enum follows established pattern; item_metadata JSON field stores citations/usage
- [P03] **Sync vs async API patterns**: Save operation is sync mutation regardless of research API pattern
- [P03] **Gemini polling duration**: Save button only enabled when research complete (status === "COMPLETED")

### ASCII Reminder
All output files must use ASCII-only characters (0-127).

---

## 9. Testing Strategy

### Unit Tests
- Not required for this session (frontend tests infrastructure not in place per CONSIDERATIONS.md)

### Integration Tests
- Not required for this session

### Manual Testing
- Complete Perplexity deep research query, click Save, verify item in Items page
- Complete Gemini deep research query, click Save, verify item in Items page
- Verify perplexity badge displays with correct styling
- Verify gemini badge displays with correct styling
- Verify filter dropdown includes new options
- Verify filtering returns only items of selected type
- Verify keyboard navigation to Save button works
- Verify Save button has accessible label

### Edge Cases
- Empty research result (no content) - Save button should still work, store what's available
- Save same research twice - Both saves should succeed (separate items)
- Save while mutation pending - Button disabled prevents double-save

---

## 10. Dependencies

### External Libraries
- No new dependencies required
- Uses existing: @tanstack/react-query, sonner, lucide-react, react-markdown

### Other Sessions
- **Depends on**: phase04-session04, phase04-session05, phase02-session02, phase02-session03
- **Depended by**: None (final session of Phase 04)

---

## Next Steps

Run `/tasks` to generate the implementation task checklist.

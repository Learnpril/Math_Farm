# Mastery Level Debug Summary

## Current Issue

The mastery level is still showing 0% even after answering questions correctly.

## Debugging Steps Added

### 1. Console Logging in recordPracticeAttempt

Added detailed logging to track when practice attempts are recorded:

```typescript
console.log('Mastery Update:', {
  chapterId,
  problemId,
  score,
  correctProblems,
  totalChapterProblems,
  newMasteryLevel: Math.round(newMasteryLevel * 100) + '%',
  practiceScores: newPracticeScores,
});
```

### 2. Console Logging in getCurrentMasteryLevel

Added logging to track mastery level calculations:

```typescript
console.log('getCurrentMasteryLevel Debug:', {
  chapterId,
  totalProblems,
  storedMastery,
  calculatedMastery,
  finalMastery,
  practiceScores: chapterProgress.practiceScores,
});
```

### 3. Console Logging in ChapterContent

Added logging to track what the UI component sees:

```typescript
console.log('ChapterContent Debug:', {
  chapterId: chapter.id,
  totalProblems,
  currentMasteryLevel,
  masteryPercentage: Math.round(currentMasteryLevel * 100) + '%',
  chapterProgressFromHook: fullProgress.chapterProgress[chapter.id],
  chapterProgressFromProp: progress,
});
```

### 4. Fixed Calculation Logic

Changed getCurrentMasteryLevel to always calculate from current state:

```typescript
// Always calculate from current state to ensure real-time updates
return calculatedMastery;
```

## Testing Instructions

1. **Open Browser Console** (F12 → Console tab)
2. **Navigate to any chapter's Practice section**
3. **Answer a question correctly**
4. **Check console logs** for:
   - "Mastery Update:" - Should show the practice attempt being recorded
   - "getCurrentMasteryLevel Debug:" - Should show mastery calculation
   - "ChapterContent Debug:" - Should show what the UI sees

## Expected Console Output

When answering the first question correctly in a chapter with 5 problems:

```
Mastery Update: {
  chapterId: "chapter-01",
  problemId: "p1-1",
  score: 1,
  correctProblems: 1,
  totalChapterProblems: 5,
  newMasteryLevel: "20%",
  practiceScores: { "p1-1": 1 }
}

getCurrentMasteryLevel Debug: {
  chapterId: "chapter-01",
  totalProblems: 5,
  storedMastery: 0.2,
  calculatedMastery: 0.2,
  finalMastery: 0.2,
  practiceScores: { "p1-1": 1 }
}

ChapterContent Debug: {
  chapterId: "chapter-01",
  totalProblems: 5,
  currentMasteryLevel: 0.2,
  masteryPercentage: "20%",
  chapterProgressFromHook: { masteryLevel: 0.2, practiceScores: { "p1-1": 1 }, ... },
  chapterProgressFromProp: { masteryLevel: 0.2, practiceScores: { "p1-1": 1 }, ... }
}
```

## Potential Issues to Check

1. **No "Mastery Update" logs** → recordPracticeAttempt not being called
2. **Score is 0 instead of 1** → Answer validation failing
3. **correctProblems is 0** → Practice scores not being stored correctly
4. **ChapterContent shows 0%** → Component not re-rendering with updated state
5. **Different values between hook and prop** → State synchronization issue

## Next Steps Based on Console Output

- **If no logs appear**: Check if handleAnswer function is being called
- **If score is always 0**: Debug answer validation logic
- **If mastery calculates correctly but UI shows 0%**: Fix component re-rendering
- **If practice scores are empty**: Check localStorage persistence

This debugging will help identify exactly where the mastery level update is failing.

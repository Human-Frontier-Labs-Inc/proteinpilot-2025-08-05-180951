# UI/UX Modifications Plan for ProteinPilot

## Overview
This document outlines the UI/UX modifications needed to transform the AI SaaS template into ProteinPilot, focusing on protein tracking and meal planning features while maintaining the template's design system.

## Design Principles
1. **Maintain Template Consistency**: Use existing Shadcn UI components
2. **Mobile-First**: Optimize for on-the-go food logging
3. **Quick Actions**: Minimize taps for common tasks
4. **Visual Feedback**: Charts and progress indicators for motivation
5. **Accessibility**: WCAG 2.1 AA compliance

## Navigation Structure Modifications

### Current Template Structure
```
├── Landing Page
├── Dashboard
├── Conversation
├── Code Generation
├── Image Generation
├── Music Generation
├── Video Generation
└── Settings
```

### New ProteinPilot Structure
```
├── Landing Page (modified)
├── Dashboard (protein tracking overview)
├── Food Log (replaces Conversation)
├── Quick Add (replaces Image)
├── Meal Plans (replaces Code)
├── Insights (replaces Music)
├── Grocery List (replaces Video)
└── Settings (extended)
```

## Page-by-Page Modifications

### 1. Landing Page (`app/(landing)/page.tsx`)

#### Keep
- Hero section structure
- Feature cards layout
- Pricing section
- Testimonials

#### Modify
```typescript
// Hero content
const heroContent = {
  title: "Track Protein Like a Pro",
  subtitle: "AI-powered nutrition tracking that helps you reach your fitness goals",
  cta: "Start Free Trial",
  features: [
    "📸 Snap & Track - Instant food recognition",
    "🎯 Hit your daily protein goals",
    "📊 Visual progress tracking",
    "🛒 One-click grocery ordering"
  ]
};

// Feature cards
const features = [
  {
    icon: Camera,
    title: "Smart Food Recognition",
    description: "Take a photo and get instant nutritional information"
  },
  {
    icon: Target,
    title: "Personalized Goals",
    description: "Set and track daily protein targets based on your needs"
  },
  {
    icon: Calendar,
    title: "Meal Planning",
    description: "AI-generated meal plans that fit your lifestyle"
  },
  {
    icon: ShoppingCart,
    title: "Grocery Integration",
    description: "Order ingredients directly from your meal plan"
  }
];
```

### 2. Dashboard (`app/(dashboard)/(routes)/dashboard/page.tsx`)

#### New Layout
```typescript
// Dashboard components structure
<DashboardLayout>
  <DailyProteinCard>
    <CircularProgress value={proteinConsumed} max={proteinGoal} />
    <QuickAddButton />
  </DailyProteinCard>
  
  <TodaysFoodLog>
    <MealSection meal="breakfast" />
    <MealSection meal="lunch" />
    <MealSection meal="dinner" />
    <MealSection meal="snacks" />
  </TodaysFoodLog>
  
  <WeeklyProgress>
    <ProteinChart data={weeklyData} />
  </WeeklyProgress>
  
  <QuickActions>
    <ActionCard icon={Camera} label="Scan Food" href="/quick-add" />
    <ActionCard icon={Book} label="Meal Plan" href="/meal-plans" />
    <ActionCard icon={TrendingUp} label="Insights" href="/insights" />
  </QuickActions>
</DashboardLayout>
```

#### Component Examples
```typescript
// components/dashboard/daily-protein-card.tsx
export function DailyProteinCard() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Today's Protein</CardTitle>
        <CardDescription>
          {format(new Date(), 'EEEE, MMMM d')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-48 h-48 mx-auto">
          <CircularProgress
            value={consumed}
            max={goal}
            size="lg"
            showValue
            unit="g"
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-2xl font-bold">{consumed}g / {goal}g</p>
          <p className="text-sm text-muted-foreground">
            {remaining}g remaining
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg">
          <Plus className="mr-2 h-4 w-4" /> Quick Add
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 3. Food Log Page (`app/(dashboard)/(routes)/food-log/page.tsx`)
Replaces the Conversation page

#### Features
- Calendar view for historical data
- Daily food entries grouped by meal
- Search and filter capabilities
- Quick edit/delete actions

```typescript
// Main food log interface
<FoodLogLayout>
  <DatePicker 
    selected={selectedDate}
    onChange={setSelectedDate}
  />
  
  <DailySummary date={selectedDate}>
    <NutritionOverview />
    <ProteinProgress />
  </DailySummary>
  
  <FoodEntries date={selectedDate}>
    {meals.map(meal => (
      <MealCard key={meal.type} meal={meal}>
        {meal.entries.map(entry => (
          <FoodEntryItem 
            key={entry.id}
            entry={entry}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        <AddFoodButton mealType={meal.type} />
      </MealCard>
    ))}
  </FoodEntries>
</FoodLogLayout>
```

### 4. Quick Add Page (`app/(dashboard)/(routes)/quick-add/page.tsx`)
Replaces the Image Generation page

#### Layout
```typescript
<QuickAddLayout>
  <Tabs defaultValue="camera">
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="camera">Camera</TabsTrigger>
      <TabsTrigger value="search">Search</TabsTrigger>
      <TabsTrigger value="favorites">Favorites</TabsTrigger>
    </TabsList>
    
    <TabsContent value="camera">
      <CameraCapture onCapture={handleImageCapture} />
      <RecognitionResults results={recognitionResults} />
    </TabsContent>
    
    <TabsContent value="search">
      <SearchBar placeholder="Search foods..." />
      <SearchResults />
    </TabsContent>
    
    <TabsContent value="favorites">
      <FavoritesList onSelect={handleQuickAdd} />
    </TabsContent>
  </Tabs>
</QuickAddLayout>
```

### 5. Meal Plans Page (`app/(dashboard)/(routes)/meal-plans/page.tsx`)
Replaces the Code Generation page

#### Features
- Weekly meal calendar
- Drag-and-drop meal arrangement
- Nutrition targets per meal
- Shopping list generation

```typescript
<MealPlansLayout>
  <MealPlanHeader>
    <h1>Your Meal Plans</h1>
    <Button onClick={generateNewPlan}>
      <Sparkles className="mr-2 h-4 w-4" />
      Generate New Plan
    </Button>
  </MealPlanHeader>
  
  <ActivePlanCard plan={activePlan}>
    <PlanStats 
      avgProtein={plan.avgDailyProtein}
      avgCalories={plan.avgDailyCalories}
    />
    <WeekView 
      meals={plan.meals}
      onMealClick={handleMealClick}
    />
  </ActivePlanCard>
  
  <SavedPlans>
    {savedPlans.map(plan => (
      <PlanCard 
        key={plan.id}
        plan={plan}
        onActivate={handleActivate}
        onDelete={handleDelete}
      />
    ))}
  </SavedPlans>
</MealPlansLayout>
```

### 6. Settings Page Modifications

#### New Sections
```typescript
const settingsCategories = [
  {
    title: "Profile & Goals",
    items: [
      { label: "Daily Protein Target", type: "number", unit: "g" },
      { label: "Activity Level", type: "select", options: activityLevels },
      { label: "Dietary Restrictions", type: "multiselect", options: restrictions },
      { label: "Allergies", type: "multiselect", options: allergens }
    ]
  },
  {
    title: "Privacy & Security",
    items: [
      { label: "Data Sharing", type: "toggle" },
      { label: "Export My Data", type: "button", action: exportData },
      { label: "Delete Account", type: "danger-button", action: deleteAccount }
    ]
  },
  {
    title: "Notifications",
    items: [
      { label: "Meal Reminders", type: "toggle" },
      { label: "Daily Summary", type: "time-picker" },
      { label: "Achievement Alerts", type: "toggle" }
    ]
  },
  {
    title: "Integrations",
    items: [
      { label: "Apple Health", type: "connect-button" },
      { label: "Google Fit", type: "connect-button" },
      { label: "MyFitnessPal", type: "connect-button" }
    ]
  }
];
```

## Mobile-Specific Optimizations

### 1. Bottom Navigation
```typescript
// components/mobile-nav.tsx
<MobileNav className="fixed bottom-0 left-0 right-0 md:hidden">
  <NavItem icon={Home} label="Home" href="/dashboard" />
  <NavItem icon={Camera} label="Add" href="/quick-add" />
  <NavItem icon={Book} label="Plans" href="/meal-plans" />
  <NavItem icon={User} label="Profile" href="/settings" />
</MobileNav>
```

### 2. Swipe Gestures
- Swipe between days in food log
- Swipe to delete food entries
- Pull to refresh dashboard

### 3. Camera Interface
```typescript
// Optimized mobile camera capture
<CameraInterface>
  <div className="relative aspect-square">
    <Camera ref={cameraRef} />
    <GuideOverlay>
      <p>Center food in frame</p>
    </GuideOverlay>
  </div>
  <CaptureButton onClick={capture} size="lg" />
  <div className="flex justify-between mt-4">
    <Button variant="ghost" onClick={openGallery}>
      <ImageIcon className="h-4 w-4" />
    </Button>
    <Button variant="ghost" onClick={toggleFlash}>
      <Zap className={flash ? "text-yellow-500" : ""} />
    </Button>
  </div>
</CameraInterface>
```

## Component Library Extensions

### 1. New Components Needed
```typescript
// components/ui/circular-progress.tsx
// components/ui/nutrition-label.tsx
// components/ui/meal-card.tsx
// components/ui/food-entry-item.tsx
// components/ui/macro-breakdown.tsx
```

### 2. Modified Existing Components
- **Card**: Add nutrition variant with macro display
- **Button**: Add food-logging quick actions
- **Badge**: Add nutrition badges (high-protein, low-carb, etc.)
- **Progress**: Add daily goal tracking variant

## Visual Design System

### 1. Color Scheme Modifications
```css
:root {
  /* Keep existing colors, add nutrition-specific */
  --protein: 210 100% 50%; /* Blue for protein */
  --carbs: 45 100% 50%; /* Orange for carbs */
  --fats: 120 100% 40%; /* Green for fats */
  --calories: 0 100% 50%; /* Red for calories */
}
```

### 2. Icons Set
- Food categories (meat, dairy, grains, etc.)
- Meal types (breakfast, lunch, dinner, snack)
- Nutrition indicators
- Achievement badges

### 3. Animations
- Progress ring fill animation
- Food entry slide-in
- Achievement celebration
- Loading states for image recognition

## Accessibility Considerations

### 1. Screen Reader Support
- Proper ARIA labels for all interactive elements
- Nutrition data announced clearly
- Progress announcements

### 2. Keyboard Navigation
- Tab order optimization
- Keyboard shortcuts for quick add
- Focus management in modals

### 3. Color Contrast
- Ensure all text meets WCAG AA standards
- Alternative indicators beyond color
- High contrast mode support

## Implementation Priority

### Phase 1: Core UI (Week 1)
1. Dashboard layout with protein tracking
2. Quick add camera interface
3. Basic food log display
4. Mobile navigation

### Phase 2: Enhanced Features (Week 2)
1. Meal planning interface
2. Search and filtering
3. Settings extensions
4. Progress visualizations

### Phase 3: Polish (Week 3)
1. Animations and transitions
2. Empty states and loading states
3. Error handling UI
4. Accessibility audit

## Performance Considerations

### 1. Image Optimization
- Lazy load food images
- Progressive image loading
- Thumbnail generation

### 2. Data Loading
- Pagination for food logs
- Virtual scrolling for long lists
- Optimistic UI updates

### 3. PWA Features
- Offline food logging
- Background sync
- Push notifications
- Add to home screen
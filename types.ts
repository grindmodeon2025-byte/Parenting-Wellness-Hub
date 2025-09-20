export enum View {
  DASHBOARD,
  PARENTING_PLANNER,
  MEAL_PLANNER,
  EMOTION_CHECKIN,
  PRODUCT_AVAILABILITY,
  RECIPES,
  ADMIN_PANEL,
}

// Corresponds to Tab 1: Users
export interface User {
  UserID: string;
  Name: string;
  Email: string;
  ParentAge: number;
  PINCode: string;
  BabyBirthDate: string;
  FamilyPreferences: string;
  RegistrationDate: string;
  RegistrationExpiry: string;
  userType: 'user' | 'admin';
}

// Corresponds to Tab 2: ParentingPlanner
export interface ParentingPlannerRecord {
  PlannerID: string;
  UserID: string;
  BabyAgeMonths: number;
  GeneratedDate: string;
  FeedingRoutine: string[];
  SleepingRoutine: string[];
  PlaytimeRoutine: string[];
  Notes?: string;
}

// Type for the AI response before it's structured into a record
export interface AIGeneratedPlan {
  FeedingRoutine: string[];
  SleepingRoutine: string[];
  PlaytimeRoutine: string[];
}


// Corresponds to Tab 3: MealPlans
export interface MealPlanRecord {
  MealPlanID: string;
  UserID: string;
  WeekStartDate: string;
  BabyAgeMonths: number;
  FamilyPreferences: string;
  LocalFoods: string; // Could be a JSON string or comma-separated
  Breakfast: string; // JSON array string
  Lunch: string; // JSON array string
  Dinner: string; // JSON array string
  Snacks: string; // JSON array string
  Notes?: string;
}

// The structure of the AI-generated weekly meal plan
export interface WeeklyMealPlan {
  mother: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  child: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
}


// Corresponds to Tab 4: Recipes
export interface RecipeRecord {
  RecipeID: string;
  MealPlanID: string;
  UserID: string;
  BabyAgeMonths: number;
  RecipeName: string;
  Ingredients: string[];
  Instructions: string[];
  SuitableFor: 'Mom' | 'Baby' | 'Both';
  LocalIngredientUsed: boolean;
  Notes?: string;
}

// Type for the AI recipe generation response
export interface AIGeneratedRecipe {
  RecipeName: string;
  Ingredients: string[];
  Instructions: string[];
  SuitableFor: 'Mom' | 'Baby' | 'Both';
  LocalIngredientUsed: boolean;
}

// Corresponds to Tab 5: EmotionCheckins
export interface EmotionCheckinRecord {
  CheckinID: string;
  UserID: string;
  CheckinDate: string;
  Mood: string;
  Affirmation: string;
  StressReliefExercise: string;
  PepTalk: string;
  Notes?: string;
}

// Type for the AI emotional support response
export interface AIGeneratedEmotionSupport {
    Affirmation: string;
    StressReliefExercise: string;
    PepTalk: string;
}

// Corresponds to Tab 6: ProductAvailability
export interface ProductAvailabilityRecord {
    ProductID: string;
    RecipeID: string;
    ProductName: string;
    PINCode: string;
    AvailabilityStatus: 'Available' | 'Unavailable' | 'Seasonal';
    Notes?: string;
}
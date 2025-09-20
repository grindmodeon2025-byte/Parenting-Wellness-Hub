import { User, ParentingPlannerRecord, MealPlanRecord, RecipeRecord, EmotionCheckinRecord, ProductAvailabilityRecord } from '../types';

// The registration process completes a pre-existing record.
// So RegisterData contains the fields a user provides to complete their profile.
export type RegisterData = Omit<User, 'UserID' | 'userType' | 'RegistrationDate' | 'RegistrationExpiry'>;

// Define a type for the User object as stored internally, including the password
type StoredUser = User & { password?: string };

class MockGoogleSheetService {
  private _users: StoredUser[];
  private _planners: ParentingPlannerRecord[];
  private _mealPlans: MealPlanRecord[];
  private _recipes: RecipeRecord[];
  private _checkins: EmotionCheckinRecord[];
  private _products: ProductAvailabilityRecord[];
  
  constructor() {
    this._users = [
      { 
          UserID: 'user-1', Name: 'Test User', Email: 'user@example.com', password: 'password123', 
          ParentAge: 32, BabyBirthDate: '2024-05-15', PINCode: '110001', FamilyPreferences: 'Vegetarian', 
          RegistrationDate: '2024-01-01T10:00:00Z', RegistrationExpiry: '2099-12-31T23:59:59Z', userType: 'user' 
      },
      { 
          UserID: 'user-2', Name: 'Admin User', Email: 'admin@example.com', password: 'admin123', 
          ParentAge: 35, BabyBirthDate: '2024-03-10', PINCode: '560001', FamilyPreferences: 'Non-vegetarian, likes spicy food',
          RegistrationDate: '2024-01-01T10:00:00Z', RegistrationExpiry: '2099-12-31T23:59:59Z', userType: 'admin'
      },
      {
          UserID: 'user-3', Name: '', Email: 'new-user@example.com', password: '',
          ParentAge: 0, BabyBirthDate: '', PINCode: '', FamilyPreferences: '',
          RegistrationDate: '', RegistrationExpiry: '', userType: 'user'
      },
      { 
          UserID: 'user-4', Name: 'Expired User', Email: 'expired@example.com', password: 'password123', 
          ParentAge: 40, BabyBirthDate: '2023-01-01', PINCode: '123456', FamilyPreferences: 'Anything',
          RegistrationDate: '2023-01-01T10:00:00Z', RegistrationExpiry: '2024-01-01T23:59:59Z', userType: 'user'
      },
    ];
    this._planners = [{ PlannerID: 'p1', UserID: 'user-1', BabyAgeMonths: 2, GeneratedDate: new Date().toISOString(), FeedingRoutine: ["Feed every 2-3 hours"], SleepingRoutine: ["Swaddle for sleep"], PlaytimeRoutine: ["Tummy time"] }];
    this._mealPlans = [{ MealPlanID: 'm1', UserID: 'user-1', WeekStartDate: new Date().toISOString(), BabyAgeMonths: 2, FamilyPreferences: 'Vegetarian', LocalFoods: 'Paneer, Lentils', Breakfast: '["Oatmeal"]', Lunch: '["Dal Rice"]', Dinner: '["Khichdi"]', Snacks: '["Yogurt"]' }];
    this._recipes = [{ RecipeID: 'r1', MealPlanID: 'm1', UserID: 'user-1', BabyAgeMonths: 6, RecipeName: 'Oatmeal Porridge', Ingredients: ["Oats", "Water"], Instructions: ["Boil water, add oats"], SuitableFor: 'Baby', LocalIngredientUsed: false }];
    this._checkins = [
        { CheckinID: 'c1', UserID: 'user-1', CheckinDate: new Date().toISOString(), Mood: 'Happy', Affirmation: "I am a great parent.", StressReliefExercise: "Deep breathing.", PepTalk: "You've got this!" },
        { CheckinID: 'c2', UserID: 'user-2', CheckinDate: new Date().toISOString(), Mood: 'Tired', Affirmation: "It's okay to rest.", StressReliefExercise: "Stretch your arms.", PepTalk: "Take a break." },
    ];
    this._products = [{ ProductID: 'prod-1', RecipeID: 'r1', ProductName: 'Organic Oats', PINCode: '110001', AvailabilityStatus: 'Available' }];
  }

  // Simulate network delay
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(email: string, password?: string): Promise<User> {
    await this.delay(500);
    const user = this._users.find(u => u.Email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Check for registration expiry
    const expiryDate = new Date(user.RegistrationExpiry);
    const now = new Date();
    if (now > expiryDate) {
        throw new Error('Your registration has expired. Please contact support.');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async register(data: RegisterData, password?: string): Promise<User> {
    await this.delay(500);
    const userIndex = this._users.findIndex(u => u.Email === data.Email);
    
    if (userIndex === -1) {
      throw new Error('Invalid E-Mail ID provided. This email is not available for registration.');
    }

    const existingUser = this._users[userIndex];
    
    const registrationDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(registrationDate.getDate() + 90);

    // Update the existing user record with the new details from the registration form
    const updatedUser: StoredUser = {
        ...existingUser,
        ...data,
        password: password,
        RegistrationDate: registrationDate.toISOString(),
        RegistrationExpiry: expiryDate.toISOString(),
    };

    this._users[userIndex] = updatedUser;
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
  
  async resetPassword(email: string, newPassword: string): Promise<void> {
    await this.delay(500);
    const userIndex = this._users.findIndex(u => u.Email === email);
    if (userIndex === -1) {
      throw new Error('No user found with this email address.');
    }
    this._users[userIndex].password = newPassword;
  }

  async getDashboardStats() {
    await this.delay(300);
    return {
        summaryStats: {
            activeUsers: this._users.length,
            newSignups: 1, // mock
            mealPlansGenerated: this._mealPlans.length,
            interactions: this._planners.length + this._mealPlans.length + this._checkins.length,
        },
        interactionData: [
            { name: 'Planner', interactions: this._planners.length },
            { name: 'Meals', interactions: this._mealPlans.length },
            { name: 'Check-ins', interactions: this._checkins.length },
        ]
    };
  }
  
  private objectToCsv(data: any[], headers: string[]): string {
    if (data.length === 0) return headers.join(',');
    const csvRows = [
      headers.join(','), 
      ...data.map(row => 
        headers.map(fieldName => 
          JSON.stringify(row[fieldName], (_, value) => value === undefined ? '' : value)
        ).join(',')
      )
    ];
    return csvRows.join('\n');
  }

  async getSheetAsCSV(sheetName: string): Promise<string> {
    await this.delay(200);
    switch (sheetName) {
      case 'Users':
        const userHeaders = ['UserID', 'Name', 'Email', 'ParentAge', 'PINCode', 'BabyBirthDate', 'FamilyPreferences', 'RegistrationDate', 'RegistrationExpiry', 'password'];
        return this.objectToCsv(this._users, userHeaders);
      case 'ParentingPlanner':
        return this.objectToCsv(this._planners, ['PlannerID', 'UserID', 'BabyAgeMonths', 'GeneratedDate', 'FeedingRoutine', 'SleepingRoutine', 'PlaytimeRoutine', 'Notes']);
      case 'MealPlans':
        return this.objectToCsv(this._mealPlans, ['MealPlanID', 'UserID', 'WeekStartDate', 'BabyAgeMonths', 'FamilyPreferences', 'LocalFoods', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Notes']);
      case 'Recipes':
        return this.objectToCsv(this._recipes, ['RecipeID', 'MealPlanID', 'UserID', 'BabyAgeMonths', 'RecipeName', 'Ingredients', 'Instructions', 'SuitableFor', 'LocalIngredientUsed', 'Notes']);
      case 'EmotionCheckins':
        return this.objectToCsv(this._checkins, ['CheckinID', 'UserID', 'CheckinDate', 'Mood', 'Affirmation', 'StressReliefExercise', 'PepTalk', 'Notes']);
      case 'ProductAvailability':
        return this.objectToCsv(this._products, ['ProductID', 'RecipeID', 'ProductName', 'PINCode', 'AvailabilityStatus', 'Notes']);
      default:
        throw new Error("Sheet not found");
    }
  }
}

export const mockSheetService = new MockGoogleSheetService();
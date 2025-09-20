import React, { useState, useRef, useEffect } from 'react';
import type { WeeklyMealPlan, AIGeneratedRecipe } from '../types';
import { generateMealPlan, generateRecipe } from '../services/geminiService';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

// Modal component defined in the same file to avoid unmounting issues
interface RecipeModalProps {
    recipe: AIGeneratedRecipe | null;
    onClose: () => void;
    isLoading: boolean;
}
const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose, isLoading }) => {
    if (!recipe && !isLoading) return null;

    const printableRef = useRef<HTMLDivElement>(null);
    const [copyButtonText, setCopyButtonText] = useState('Copy Instructions');

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow && printableRef.current) {
            printWindow.document.write('<html><head><title>Recipe</title>');
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
            printWindow.document.write('</head><body class="p-8 font-sans">');
            printWindow.document.write(printableRef.current.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleOrder = (store: 'Blinkit' | 'Zepto') => {
        if (!recipe || !recipe.Ingredients || recipe.Ingredients.length === 0) return;

        // Clean up ingredients for a better search query (e.g., remove quantities in parentheses)
        const cleanedIngredients = recipe.Ingredients.map(ing => ing.split('(')[0].trim());
        const searchQuery = encodeURIComponent(cleanedIngredients.join(', '));
        
        let url = '';
        if (store === 'Blinkit') {
            url = `https://blinkit.com/s?q=${searchQuery}`;
        } else if (store === 'Zepto') {
            url = `https://www.zeptonow.com/search?q=${searchQuery}`;
        }

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleCopy = () => {
        if (recipe && navigator.clipboard) {
            const instructionsText = recipe.Instructions.map((step, i) => `${i + 1}. ${step}`).join('\n');
            navigator.clipboard.writeText(instructionsText).then(() => {
                setCopyButtonText('Copied!');
                setTimeout(() => setCopyButtonText('Copy Instructions'), 2000);
            });
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {isLoading ? <LoadingSpinner /> : (
                recipe && (
                    <>
                    <div ref={printableRef}>
                        <h3 className="text-2xl font-bold mb-4 text-teal-700">{recipe.RecipeName}</h3>
                        <div className="flex justify-between text-sm text-slate-500 mb-4">
                            <span>Suitable For: <span className="font-semibold text-teal-600">{recipe.SuitableFor}</span></span>
                            <span>Uses Local Ingredients: <span className="font-semibold text-teal-600">{recipe.LocalIngredientUsed ? 'Yes' : 'No'}</span></span>
                        </div>
                        <div className="mb-4">
                            <h4 className="font-semibold text-lg text-slate-800 mb-2">Ingredients</h4>
                            <ul className="list-disc list-inside text-slate-600 space-y-1">
                                {recipe.Ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg text-slate-800 mb-2">Instructions</h4>
                            <ol className="list-decimal list-inside text-slate-600 space-y-2">
                                {recipe.Instructions.map((step, i) => <li key={i}>{step}</li>)}
                            </ol>
                        </div>
                    </div>

                    {/* Order Ingredients Section */}
                    <div className="mt-6 border-t pt-4">
                        <h4 className="font-semibold text-lg text-slate-800 mb-2">Order Ingredients</h4>
                        <p className="text-sm text-slate-500 mb-4">
                            Get everything you need delivered from a local store.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button 
                                onClick={() => handleOrder('Blinkit')} 
                                className="!bg-green-500 !hover:bg-green-600 !focus:ring-green-500 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Order on Blinkit
                            </Button>
                            <Button 
                                onClick={() => handleOrder('Zepto')} 
                                className="!bg-purple-500 !hover:bg-purple-600 !focus:ring-purple-500 flex items-center gap-2"
                            >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Order on Zepto
                            </Button>
                        </div>
                    </div>

                     <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                        <Button onClick={handleCopy} variant="ghost">{copyButtonText}</Button>
                        <Button onClick={handlePrint} variant="ghost">Print / Save PDF</Button>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                    </>
                )
            )}
            </div>
        </div>
    );
};


interface MealPlannerProps {
  navigateToDashboard: () => void;
}
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MealPlanner: React.FC<MealPlannerProps> = ({ navigateToDashboard }) => {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedRecipe, setSelectedRecipe] = useState<AIGeneratedRecipe | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  const [specificRecipeQuery, setSpecificRecipeQuery] = useState('');
  const [allRecipesForPlan, setAllRecipesForPlan] = useState<AIGeneratedRecipe[]>([]);
  const [isFetchingRecipes, setIsFetchingRecipes] = useState(false);
  
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedSearches = localStorage.getItem('recipeSearches');
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (e) {
      console.error("Failed to parse recent searches from localStorage", e);
      localStorage.removeItem('recipeSearches');
    }
  }, []);

  const addRecentSearch = (query: string) => {
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recipeSearches', JSON.stringify(updatedSearches));
  };


  const fetchAllRecipesForPlan = async (plan: WeeklyMealPlan) => {
    setIsFetchingRecipes(true);
    setAllRecipesForPlan([]);
    const mealNames = new Set<string>();

    const processMeals = (dailyPlan: WeeklyMealPlan['mother'] | WeeklyMealPlan['child']) => {
        if (!dailyPlan) return;
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
            const meals = dailyPlan[mealType as keyof typeof dailyPlan];
            if (Array.isArray(meals)) {
                meals.forEach(meal => {
                    if (meal && typeof meal === 'string' && !meal.toLowerCase().includes('milk')) {
                        mealNames.add(meal);
                    }
                });
            }
        });
    };

    processMeals(plan.mother);
    processMeals(plan.child);

    const fetchedRecipes: AIGeneratedRecipe[] = [];
    try {
      for (const name of Array.from(mealNames)) {
        // Process requests sequentially to avoid rate limiting
        const recipe = await generateRecipe(name);
        if (recipe) {
          fetchedRecipes.push(recipe);
        }
      }
      setAllRecipesForPlan(fetchedRecipes);
    } catch (e) {
      console.error("Error fetching all recipes:", e);
      // If an error occurs (like rate limiting), we still show what we've got
      setAllRecipesForPlan(fetchedRecipes);
      setError("Could not fetch all recipes due to API limits. Some recipes may be missing from the printable plan.");
    } finally {
      setIsFetchingRecipes(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!user) {
      setError('User data not found. Please log in again.');
      return;
    }
    setError('');
    setIsLoading(true);
    setMealPlan(null);
    setAllRecipesForPlan([]);

    const dob = new Date(user.BabyBirthDate);
    const now = new Date();
    const ageInWeeks = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 7));

    try {
      const result = await generateMealPlan(user.FamilyPreferences, user.PINCode, user.ParentAge, ageInWeeks);
      if (result) {
        setMealPlan(result);
        await fetchAllRecipesForPlan(result);
      } else {
        setError('Failed to generate a meal plan. The AI service may be unavailable.');
      }
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewRecipe = async (mealName: string) => {
    if (!mealName || mealName.toLowerCase().includes('milk')) return;
    setIsModalLoading(true);
    setSelectedRecipe(null);
    const recipe = await generateRecipe(mealName);
    setSelectedRecipe(recipe);
    setIsModalLoading(false);
  };

  const handleSpecificRecipeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specificRecipeQuery.trim()) {
        setError("Please enter a dish name.");
        return;
    }
    setError('');
    addRecentSearch(specificRecipeQuery);
    handleViewRecipe(specificRecipeQuery);
  }

  const handleRecentSearchClick = (query: string) => {
    setSpecificRecipeQuery(query);
    setError('');
    handleViewRecipe(query);
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow && printableRef.current) {
        printWindow.document.write('<html><head><title>Weekly Meal Plan & Recipes</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write('<style>@media print { .print-view { padding: 0 !important; } .print\\:break-before-page { page-break-before: always; } .print\\:break-inside-avoid { page-break-inside: avoid; } .print\\:border-none { border: none !important; } .print\\:p-0 { padding: 0 !important; } }</style>');
        printWindow.document.write('</head><body class="p-8 print-view">');
        printWindow.document.write(printableRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
  };
  
  const renderPlan = (plan: WeeklyMealPlan['mother'] | WeeklyMealPlan['child'], title: string) => {
      if (!plan) {
        return <p className="text-center text-slate-500">Plan details for {title.toLowerCase()} are not available.</p>;
      }
      return (
        <div className="mb-8">
            <h3 className="text-2xl font-bold text-center border-b pb-2 mb-4">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                {daysOfWeek.map((day, index) => (
                <div key={day} className="bg-slate-50 p-4 rounded-lg border">
                    <h4 className="font-bold text-lg text-center text-teal-700 mb-3">{day}</h4>
                    <div className="space-y-3 text-sm">
                    <MealItem label="Breakfast" meal={plan.breakfast?.[index] || ''} onViewRecipe={handleViewRecipe} />
                    <MealItem label="Lunch" meal={plan.lunch?.[index] || ''} onViewRecipe={handleViewRecipe} />
                    <MealItem label="Dinner" meal={plan.dinner?.[index] || ''} onViewRecipe={handleViewRecipe} />
                    <MealItem label="Snacks" meal={plan.snacks?.[index] || ''} onViewRecipe={handleViewRecipe} />
                    </div>
                </div>
                ))}
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md">
       <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} isLoading={isModalLoading} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">AI Meal & Nutrition Assistant</h2>
        <Button onClick={navigateToDashboard} variant="ghost">Back to Dashboard</Button>
      </div>
      
      <div className="space-y-4 mb-6 p-4 bg-slate-100 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Looking for a specific recipe?</h3>
        <form onSubmit={handleSpecificRecipeSearch} className="flex flex-col sm:flex-row gap-2">
            <input
                type="text"
                value={specificRecipeQuery}
                onChange={(e) => setSpecificRecipeQuery(e.target.value)}
                placeholder="e.g., Paneer Butter Masala"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                aria-label="Specific dish name"
            />
            <Button type="submit" variant="primary">Get Recipe</Button>
        </form>
        {recentSearches.length > 0 && (
          <div className="pt-2">
            <span className="text-sm font-medium text-slate-600 mr-2">Recent:</span>
            <div className="inline-flex flex-wrap gap-2">
              {recentSearches.map(search => (
                <button
                  key={search}
                  onClick={() => handleRecentSearchClick(search)}
                  className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-6 p-4 bg-teal-50 rounded-lg border border-teal-100">
        <p className="text-teal-800">Your family's meal preferences and PIN code from your profile will be used to generate a personalized weekly plan and all associated recipes.</p>
        <Button onClick={handleGeneratePlan} disabled={isLoading || isFetchingRecipes}>
          {isLoading ? 'Generating Plan...' : isFetchingRecipes ? 'Fetching Recipes...' : 'Generate Meal Plan'}
        </Button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {(isLoading || isFetchingRecipes) && <LoadingSpinner />}
      
      {mealPlan && (
        <div className="animate-fade-in">
          <div className="flex justify-end gap-2 mb-4">
              <Button onClick={handlePrint} variant="ghost" disabled={isFetchingRecipes}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print / Save Plan as PDF
              </Button>
          </div>
          <div ref={printableRef} className="printable-content">
             {renderPlan(mealPlan.mother, "Mother's Weekly Meal Plan")}
             {renderPlan(mealPlan.child, "Child's Weekly Meal Plan")}
             
             {allRecipesForPlan.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-3xl font-bold text-center mb-6 border-t pt-8 print:break-before-page">Full Recipes</h2>
                    <div className="space-y-8">
                        {allRecipesForPlan.map(recipe => (
                            <div key={recipe.RecipeName} className="p-4 border rounded-lg bg-slate-50 print:border-none print:p-0 print:break-inside-avoid">
                                <h3 className="text-2xl font-bold mb-4 text-teal-700">{recipe.RecipeName}</h3>
                                <div className="flex justify-between text-sm text-slate-500 mb-4">
                                    <span>Suitable For: <span className="font-semibold text-teal-600">{recipe.SuitableFor}</span></span>
                                    <span>Uses Local Ingredients: <span className="font-semibold text-teal-600">{recipe.LocalIngredientUsed ? 'Yes' : 'No'}</span></span>
                                </div>
                                <div className="mb-4">
                                    <h4 className="font-semibold text-lg text-slate-800 mb-2">Ingredients</h4>
                                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                                        {recipe.Ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg text-slate-800 mb-2">Instructions</h4>
                                    <ol className="list-decimal list-inside text-slate-600 space-y-2">
                                        {recipe.Instructions.map((step, i) => <li key={i}>{step}</li>)}
                                    </ol>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};


interface MealItemProps {
    label: string;
    meal: string;
    onViewRecipe: (meal: string) => void;
}
const MealItem: React.FC<MealItemProps> = ({ label, meal, onViewRecipe }) => {
    if (!meal) {
        return null;
    }
    const canViewRecipe = meal && !meal.toLowerCase().includes('milk');
    return (
        <div>
            <p className="font-semibold text-slate-600">{label}</p>
            <p className="text-slate-800">{meal}</p>
            {canViewRecipe && <button onClick={() => onViewRecipe(meal)} className="text-xs text-teal-600 hover:underline">View Recipe</button>}
        </div>
    );
}


export default MealPlanner;
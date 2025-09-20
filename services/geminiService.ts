
import { GoogleGenAI, Type } from "@google/genai";
import type { AIGeneratedPlan, WeeklyMealPlan, AIGeneratedRecipe, AIGeneratedEmotionSupport } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A real app would have more robust error handling or environment validation.
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateParentingPlan = async (birthDate: string): Promise<AIGeneratedPlan | null> => {
  if (!API_KEY) return null;
  const dob = new Date(birthDate);
  const now = new Date();
  const ageInWeeks = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 7));

  const prompt = `Given a baby is ${ageInWeeks} weeks old, create a detailed daily routine for a new parent. Include sections for 'FeedingRoutine', 'SleepingRoutine', and 'PlaytimeRoutine'. The routine should be supportive, gentle, and offer flexibility.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            FeedingRoutine: { type: Type.ARRAY, items: { type: Type.STRING } },
            SleepingRoutine: { type: Type.ARRAY, items: { type: Type.STRING } },
            PlaytimeRoutine: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AIGeneratedPlan;

  } catch (error) {
    console.error("Error generating parenting plan:", error);
    return null;
  }
};

const dailyMealPlanSchema = {
    type: Type.OBJECT,
    properties: {
        breakfast: { type: Type.ARRAY, items: {type: Type.STRING}, description: "An array of 7 breakfast items, one for each day of the week." },
        lunch: { type: Type.ARRAY, items: {type: Type.STRING}, description: "An array of 7 lunch items, one for each day of the week." },
        dinner: { type: Type.ARRAY, items: {type: Type.STRING}, description: "An array of 7 dinner items, one for each day of the week." },
        snacks: { type: Type.ARRAY, items: {type: Type.STRING}, description: "An array of 7 snack items, one for each day of the week." },
    }
};

export const generateMealPlan = async (preferences: string, pinCode: string, parentAge: number, babyAgeInWeeks: number): Promise<WeeklyMealPlan | null> => {
  if (!API_KEY) return null;

  const prompt = `
    Create a 7-day meal plan for a busy new parent and their baby.
    - The parent is ${parentAge} years old. Their plan should be nutritious and support postpartum recovery.
    - The baby is ${babyAgeInWeeks} weeks old. The baby's plan should be age-appropriate (e.g., milk-focused for young infants, introducing solids for older infants). If the baby is too young for solid food, state that for the baby's meals.
    - The family's general preferences are: '${preferences}'.
    - Suggest meals that incorporate ingredients commonly available in an area with the Indian PIN code '${pinCode}'.
    - Provide two separate weekly plans: one for the 'mother' and one for the 'child'. For each plan, provide a JSON array of 7 strings for each meal type: 'breakfast', 'lunch', 'dinner', and 'snacks'.
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                mother: dailyMealPlanSchema,
                child: dailyMealPlanSchema,
            }
        }
      }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as WeeklyMealPlan;

  } catch (error)
 {
    console.error("Error generating meal plan:", error);
    return null;
  }
};

export const generateRecipe = async (mealName: string): Promise<AIGeneratedRecipe | null> => {
    if (!API_KEY) return null;
    const prompt = `Provide a simple and quick recipe for '${mealName}'. Include 'Ingredients' and 'Instructions'. The recipe name should be '${mealName}'. Also specify if it's 'SuitableFor' (Mom, Baby, or Both) and if 'LocalIngredientUsed' is true or false.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        RecipeName: { type: Type.STRING },
                        Ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        Instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        SuitableFor: { type: Type.STRING, enum: ['Mom', 'Baby', 'Both'] },
                        LocalIngredientUsed: { type: Type.BOOLEAN },
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AIGeneratedRecipe;
    } catch (error) {
        console.error('Error generating recipe:', error);
        return null;
    }
};

export const generateEmotionSupport = async (mood: string): Promise<AIGeneratedEmotionSupport | null> => {
  if (!API_KEY) return null;
  const prompt = `A new parent is feeling '${mood}'. Provide a JSON object with three properties to support them: 1. 'Affirmation': A short, positive affirmation. 2. 'StressReliefExercise': A simple, quick exercise to relieve stress (e.g., a breathing technique). 3. 'PepTalk': A brief, encouraging pep talk.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
          responseMimeType: 'application/json',
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  Affirmation: { type: Type.STRING },
                  StressReliefExercise: { type: Type.STRING },
                  PepTalk: { type: Type.STRING },
              }
          }
      }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AIGeneratedEmotionSupport;
  } catch (error) {
    console.error("Error generating emotion support:", error);
    return null;
  }
};

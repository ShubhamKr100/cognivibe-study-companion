
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizQuestion, StoryData, AppLanguage, ExplanationStyle, ChatMessage, UserInterest } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// Helper to strip data URL prefix if present
const cleanBase64 = (base64Data: string) => {
  return base64Data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

export const generateStory = async (
  imageBase64: string,
  language: AppLanguage,
  style: ExplanationStyle,
  interest: UserInterest
): Promise<StoryData> => {
  const storySchema: Schema = {
    type: Type.OBJECT,
    properties: {
      content: { 
        type: Type.STRING,
        description: "The explanation content in the requested language and style."
      },
      reasoning: { 
        type: Type.STRING,
        description: "A structured text block explaining the visual analysis with emojis."
      },
    },
    required: ["content", "reasoning"],
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64(imageBase64),
            },
          },
          {
            text: `You are an expert tutor for students with learning differences. Analyze the visual input.

1. **Content Generation**: Explain the concepts in the image.
   - **Language**: ${language}
   - **Style**: ${style}
   - **Interest/Theme**: ${interest}
   
   **CRITICAL INSTRUCTION FOR ANALOGIES:**
   ${interest !== UserInterest.GENERAL 
     ? `The user loves ${interest}. You MUST explain the scientific/educational concepts using strictly ${interest} metaphors. (e.g., if Minecraft: "The cell wall is like Bedrock...", if Cricket: "The nucleus is the Captain...", if Marvel: "The mitochondria is like the Arc Reactor...").` 
     : 'Use clear, relatable everyday analogies.'}

   - Keep the tone warm, encouraging, and EL5 (Explain Like I'm 5).

2. **Reasoning Trace**: Provide a raw, step-by-step breakdown of your analysis.
   - **STRICTLY** follow this format:
     👁️ Visual Analysis: [What do you see?]
     🏷️ Key Labels: [List identified parts]
     🧠 Analogy Logic: [Explain how you mapped the visual concepts to ${interest}]
`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");
    
    return JSON.parse(jsonText) as StoryData;
  } catch (error) {
    console.error("Gemini Story Error:", error);
    throw new Error("Failed to generate story.");
  }
};

export const generateQuiz = async (
  imageBase64: string,
  language: AppLanguage
): Promise<QuizQuestion[]> => {
  const quizSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        correctAnswerIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING },
      },
      required: ["question", "options", "correctAnswerIndex", "explanation"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64(imageBase64),
            },
          },
          {
            text: `You are an expert tutor. Analyze the visual input and generate 3 NEW unique multiple-choice questions based on the concepts.
            
            Requirements:
            1. **Language**: ${language}
            2. **Randomization**: Randomly shuffle the position of the correct answer (do NOT always put it as the first option).
            3. **Format**: Return strictly JSON.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");
    
    return JSON.parse(jsonText) as QuizQuestion[];
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    throw new Error("Failed to generate quiz.");
  }
};

export const generateChatResponse = async (
  imageBase64: string,
  history: ChatMessage[],
  newMessage: string,
  language: AppLanguage
): Promise<string> => {
  try {
    const chatContext = history.map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.text}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64(imageBase64),
            },
          },
          {
            text: `You are a kind, patient, and encouraging study companion for a student with learning differences.
            The student is looking at the image provided.
            
            Current Conversation Context:
            ${chatContext}
            
            Student's New Question: "${newMessage}"
            
            Task:
            - Answer the question simply and clearly in ${language}.
            - Reference specific parts of the image if helpful.
            - Keep the tone supportive.
            - Keep the answer concise (under 3 sentences unless asked for more detail).
            `,
          },
        ],
      },
    });

    return response.text || "I'm having a little trouble thinking right now. Can you ask that again?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm sorry, I couldn't process that question right now.";
  }
};

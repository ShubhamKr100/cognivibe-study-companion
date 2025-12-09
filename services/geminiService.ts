
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizQuestion, StoryData, AppLanguage, ExplanationStyle, ChatMessage, UserInterest, MagicStep, RapidQuizItem, MindMapData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// Helper to strip data URL prefix if present
const cleanBase64 = (base64Data: string) => {
  return base64Data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

// GLOBAL PROMPT INSTRUCTION
const getLanguageInstruction = (language: AppLanguage) => 
  `IMPORTANT: You must output ALL text in the user's selected language: ${language}. Do not mix languages unless specifically asked.`;

export const generateStory = async (
  imageBase64: string,
  language: AppLanguage,
  style: ExplanationStyle,
  interest: UserInterest,
  isADHD: boolean = false
): Promise<StoryData> => {
  const storySchema: Schema = {
    type: Type.OBJECT,
    properties: {
      tldr: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: `Exactly 3 ultra-short, exam-critical facts (under 10 words each) in ${language}.`
      },
      content: { 
        type: Type.STRING,
        description: `The explanation content in ${language} and requested style.`
      },
      reasoning: { 
        type: Type.STRING,
        description: `A structured text block explaining the visual analysis with emojis in ${language}.`
      },
    },
    required: ["tldr", "content", "reasoning"],
  };

  const persona = isADHD 
    ? "You are an empathetic ADHD Study Coach. Be patient, use emojis, and focus on progress, not perfection. Keep explanations 'ELI12' (Explain Like I'm 12) - short, punchy, no jargon without definition." 
    : "You are an expert tutor for students with learning differences. Tone: Warm and encouraging.";

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
            text: `${getLanguageInstruction(language)}

${persona} Analyze the visual input.

1. **TL;DR Generation**: Extract the 3 most critical exam-worthy facts. Keep them extremely concise (under 10 words each). Translate them into ${language}.

2. **Content Generation**: Explain the concepts in the image.
   - **Language**: ${language} (Strictly enforce this)
   - **Style**: ${style}
   - **Interest/Theme**: ${interest}
   
   **CRITICAL INSTRUCTION FOR ANALOGIES:**
   ${interest !== UserInterest.GENERAL 
     ? `The user loves ${interest}. You MUST explain the scientific/educational concepts using strictly ${interest} metaphors. (e.g., if Minecraft: "The cell wall is like Bedrock...", if Cricket: "The nucleus is the Captain...", if Marvel: "The mitochondria is like the Arc Reactor...").` 
     : 'Use clear, relatable everyday analogies.'}

   - Keep the tone warm, encouraging, and EL5 (Explain Like I'm 5).

3. **Reasoning Trace**: Provide a raw, step-by-step breakdown of your analysis.
   - **STRICTLY** follow this format (Translate content to ${language}):
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
        question: { type: Type.STRING, description: `Question in ${language}` },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING, description: `Option in ${language}` },
        },
        correctAnswerIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING, description: `Explanation in ${language}` },
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
            text: `${getLanguageInstruction(language)}

            You are an expert tutor. Analyze the visual input and generate 3 NEW unique multiple-choice questions based on the concepts.
            
            Requirements:
            1. **Language**: ${language} (Strictly enforce this for questions, options, and explanations)
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

export const generateMindMap = async (
  imageBase64: string,
  language: AppLanguage
): Promise<MindMapData> => {
  const mapSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      mainTopic: { type: Type.STRING, description: `The central concept (1-3 words) in ${language}` },
      subTopics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: `Subtopic name in ${language}` },
            description: { type: Type.STRING, description: `Brief definition (1 sentence) in ${language}` }
          },
          required: ["title", "description"]
        },
        description: "5-7 key connected concepts"
      }
    },
    required: ["mainTopic", "subTopics"]
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
            text: `${getLanguageInstruction(language)}

            Analyze this image and create a hierarchical Mind Map structure in ${language}.
            Identify the ONE main topic and 5-7 key sub-components/concepts related to it.
            Translate all titles and descriptions to ${language}.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: mapSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");
    return JSON.parse(jsonText) as MindMapData;
  } catch (error) {
    console.error("Gemini Mind Map Error:", error);
    throw new Error("Failed to generate mind map.");
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
            text: `${getLanguageInstruction(language)}

            You are a kind, patient, and encouraging study companion for a student with learning differences.
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

export const generateMagicSteps = async (imageBase64: string, language: AppLanguage): Promise<MagicStep[]> => {
  const stepSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        text: { type: Type.STRING, description: `Step instruction in ${language}` },
        isCompleted: { type: Type.BOOLEAN },
      },
      required: ["id", "text", "isCompleted"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64(imageBase64) } },
          { text: `${getLanguageInstruction(language)} The user is overwhelmed. Break down the task of understanding this image/diagram into 3-5 tiny, extremely easy micro-steps (e.g., 'Step 1: Just look at the blue circle'). Use a motivating, simple tone. Return JSON.` }
        ]
      },
      config: { responseMimeType: "application/json", responseSchema: stepSchema }
    });
    return JSON.parse(response.text || "[]") as MagicStep[];
  } catch (e) { return []; }
};

export const generateRapidQuiz = async (imageBase64: string, language: AppLanguage): Promise<RapidQuizItem[]> => {
  const quizSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        question: { type: Type.STRING, description: `Question in ${language}` },
        answer: { type: Type.STRING, description: `Answer in ${language}` },
        explanation: { type: Type.STRING, description: `Short feedback in ${language}` },
      },
      required: ["id", "question", "answer", "explanation"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64(imageBase64) } },
          { text: `${getLanguageInstruction(language)} Generate 5 short True/False or Simple Choice flashcard questions based on the image. Tone: Encouraging, Fun. Return JSON.` }
        ]
      },
      config: { responseMimeType: "application/json", responseSchema: quizSchema }
    });
    return JSON.parse(response.text || "[]") as RapidQuizItem[];
  } catch (e) { return []; }
};

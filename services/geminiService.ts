// Fix: Added full content for geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import type { LearningContent, Question } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

export async function generateLearningContent(topicId: string, topicName: string, classLevel: string): Promise<LearningContent> {
    const prompt = `You are an expert educator specializing in the Indian CBSE curriculum.
Generate a concise and engaging learning module on the topic "${topicName}" specifically for a Class ${classLevel} student following the CBSE syllabus.

Your explanation must be:
1.  **CBSE-Aligned**: Strictly adhere to the key concepts and depth expected for Class ${classLevel} in the CBSE pattern.
2.  **Easy to Understand**: Use simple language, analogies, and real-world examples that a student in India can relate to. Use markdown for structure:
    - Use \`###\` for main section headings.
    - Use \`####\` for sub-headings.
    - Use \`**bold text**\` for key terms.
    - Use bulleted (\`*\`) or numbered (\`1.\`) lists for clarity.
3.  **Visually Rich**: Incorporate clear and helpful text-based diagrams (ASCII art) to illustrate important concepts. For example, for a biology topic, you could draw a simple cell. For a physics topic, a force diagram.

Example of a text-based diagram for the water cycle:
      /\\
     /  \\  <-- Condensation (Clouds)
    /____\\
      |
      | Precipitation (Rain)
      |
   \\~~~~~/
    \\~~~~/  <-- Collection (Ocean/Lake)
     \\~~~/
      ^
      | Evaporation
      |
   ~~~~~~~

The entire output should be a single block of text for the 'content' field. Respond in JSON format.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique ID for the content" },
                    topic: { type: Type.STRING, description: "The topic of the content" },
                    content: { type: Type.STRING, description: "The main learning content, formatted with diagrams and lists." },
                    difficulty: { type: Type.STRING, description: "The difficulty level" }
                }
            }
        }
    });

    const json = JSON.parse(response.text);
    return { ...json, topicId: topicId } as LearningContent;
}

export async function generateQuiz(topic: string, numberOfQuestions: number, classLevel: string): Promise<Question[]> {
  const prompt = `Create a quiz with ${numberOfQuestions} multiple-choice questions about "${topic}" for a Class ${classLevel} student. For each question, provide 4 options, the correct answer, and a brief explanation for the correct answer. The topic is ${topic}.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                questionText: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  const json = JSON.parse(response.text);
  return json.questions;
}

export async function explainConcept(concept: string): Promise<string> {
    const prompt = `Explain the concept of "${concept}" in a simple and easy-to-understand way for a student.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return response.text;
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        return imageUrl;
    }
    
    throw new Error("Image generation failed or returned no images.");
}

export async function generateStudyPlan(studentName: string, weaknesses: string[], strengths: string[], targetAudience: 'parent' | 'teacher'): Promise<string> {
    const prompt = `
        You are an expert AI academic advisor creating a personalized mini study plan for a K-12 student in India.
        The plan is for the student's ${targetAudience} to review.
        The student's name is ${studentName}.

        Student's Academic Profile:
        - Strengths: ${strengths.join(', ')}
        - Weaknesses: ${weaknesses.join(', ')}

        Your task is to create a clear, actionable, and encouraging 3-step study plan to help ${studentName} improve in their weak areas while leveraging their strengths.

        The plan should have the following structure and be formatted with markdown for headings:
        1.  **Encouraging Opener:** Start with a brief, positive opening that acknowledges ${studentName}'s strengths. Use **bold text** for emphasis.
        2.  **3-Step Study Plan:** Provide three distinct, actionable steps. For each step:
            - Use a markdown heading like "### Step 1: Revisit the Basics".
            - Suggest a specific topic to review or a type of practice exercise.
            - Briefly explain *why* this step is important.
            - Make it sound achievable and not overwhelming.
        3.  **Positive Conclusion:** End with a motivational sentence to encourage both the student and the ${targetAudience}.

        The tone should be supportive and tailored for a ${targetAudience} in India.
        Example suggestion for a weak area like 'Algebraic Equations': "Start with a 15-minute review of 'Solving for x' in linear equations. This will build a strong foundation before moving to more complex problems."
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return response.text;
}

export async function generateFlashcards(content: string, topic: string, classLevel: string): Promise<{term: string, definition: string}[]> {
  const prompt = `
    Based on the following learning content about "${topic}" for a Class ${classLevel} student, please identify 5 to 7 key terms or concepts.
    For each term, provide a very concise and easy-to-understand definition suitable for a flashcard. The definition should be a single sentence if possible.

    Learning Content:
    ---
    ${content}
    ---

    Respond in JSON format with an array of objects, where each object has a "term" and a "definition".
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING, description: "The key term or concept." },
                definition: { type: Type.STRING, description: "A concise definition of the term." },
              },
              required: ['term', 'definition'],
            },
          },
        },
      },
    },
  });

  const json = JSON.parse(response.text);
  return json.flashcards;
}
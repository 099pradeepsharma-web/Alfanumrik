// Fix: Added full content for geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import type { ChapterContent, Question, Topic } from '../types';
import { getCachedContent, setCachedContent } from './databaseService';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

/**
 * A centralized error handler for Gemini API calls.
 * It logs the original error and returns a user-friendly Error object.
 * @param error The original error caught.
 * @param context A string describing the action being performed (e.g., "generating your lesson").
 * @returns A new Error with a user-friendly message.
 */
function handleGeminiError(error: unknown, context: string): Error {
    console.error(`Error while ${context}:`, error);

    if (error instanceof Error) {
        // Check for rate limit / quota errors
        if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
            return new Error("We're experiencing high demand, which has temporarily exhausted our API quota. Please wait a few minutes and try again. We appreciate your patience!");
        }
        
        // Check for safety errors
        if (error.message.includes('SAFETY')) {
            return new Error("The content could not be generated due to safety filters. Please adjust your request and try again.");
        }

        // Check for network or DNS errors
        if (error.message.toLowerCase().includes('failed to fetch')) {
             return new Error("We couldn't reach the AI service. Please check your internet connection and try again.");
        }
    }
    
    // Generic fallback error
    return new Error(`Sorry, an unexpected error occurred while ${context}. If this continues, please try again later.`);
}

export async function generateChapterContent(topicId: string, topicName: string, classLevel: string): Promise<ChapterContent> {
    const cacheKey = `chapter_content_v2::${topicId}::${classLevel}`;
    try {
        const cachedContent = await getCachedContent(cacheKey);
        if (cachedContent) {
            console.log("Cache hit for chapter content:", cacheKey);
            return cachedContent as ChapterContent;
        }

        console.log("Cache miss for chapter content:", cacheKey);
        const prompt = `You are an expert CBSE curriculum assistant. Your task is to generate a complete, structured learning chapter for a Class ${classLevel} student on the topic "${topicName}".

The output MUST be a single, valid JSON object. Use simple, conversational language suitable for the target class level. Break down complex concepts with real-world analogies relevant to India.

The JSON object must have the following structure:
- "id": "${topicId}"
- "topic": "${topicName}"
- "classLevel": "${classLevel}"
- "learningObjectives": An array of 3-4 simple, clear learning goals (e.g., "Understand what a fraction is.").
- "coreConcepts": An array of 2-3 core concept objects. Each object must have:
    - "title": The name of the concept.
    - "explanation": A simple breakdown of the concept.
    - "example": A real-world, everyday example.
- "interactiveSimulation": An object describing a dynamic simulation for an abstract concept from the topic. It must have:
    - "type": A string, one of 'math_graph', 'science_experiment', 'timeline', or 'other'.
    - "title": A clear title for the simulation.
    - "description": A brief explanation of what the simulation demonstrates.
    - "parameters": An object with data for the simulation.
        - For 'science_experiment': { "materials": string[], "steps": string[], "observation": string }
        - For 'math_graph': { "description": "A description of a simple function and its graph", "equation": "e.g., y = x^2", "key_points": "e.g., a parabola opening upwards with vertex at (0,0)" }
        - For 'timeline': { "events": Array<{ year: string; description: string }> }
        - For 'other': { "text": "Describe the interactive element." }
- "practiceProblems": An array of 2-3 multiple-choice questions to check understanding. Each question object must have "id", "questionText", "options" (array of 4 strings), "correctAnswer", "explanation", and "topic" ("${topicName}").
- "quickSummary": A concise summary of the chapter's key points in markdown format.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        topic: { type: Type.STRING },
                        classLevel: { type: Type.STRING },
                        learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        coreConcepts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    explanation: { type: Type.STRING },
                                    example: { type: Type.STRING },
                                },
                                required: ["title", "explanation", "example"]
                            }
                        },
                        interactiveSimulation: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        observation: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        equation: { type: Type.STRING },
                                        key_points: { type: Type.STRING },
                                        events: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    year: { type: Type.STRING },
                                                    description: { type: Type.STRING }
                                                },
                                                required: ['year', 'description']
                                            }
                                        },
                                        text: { type: Type.STRING }
                                    }
                                }
                            },
                            required: ["type", "title", "description", "parameters"]
                        },
                        practiceProblems: {
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
                                required: ["id", "questionText", "options", "correctAnswer", "explanation", "topic"]
                            }
                        },
                        quickSummary: { type: Type.STRING }
                    },
                    required: ["id", "topic", "classLevel", "learningObjectives", "coreConcepts", "interactiveSimulation", "practiceProblems", "quickSummary"]
                }
            }
        });

        const jsonString = response.text.trim();
        const json = JSON.parse(jsonString);
        
        setCachedContent(cacheKey, 'chapter_content_v2', json).catch(err => {
            console.error("Failed to cache chapter content:", err);
        });
        
        return json as ChapterContent;
    } catch (error) {
        throw handleGeminiError(error, 'generating your chapter lesson');
    }
}


export async function generateQuiz(topic: string, numberOfQuestions: number, classLevel: string): Promise<Question[]> {
    const cacheKey = `quiz::${topic.replace(/\s+/g, '_')}::${classLevel}::${numberOfQuestions}`;
    try {
        const cachedData = await getCachedContent(cacheKey);
        if (cachedData && cachedData.questions) {
            console.log("Cache hit for quiz:", cacheKey);
            return cachedData.questions as Question[];
        }

        console.log("Cache miss for quiz:", cacheKey);
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
        
        setCachedContent(cacheKey, 'quiz', json).catch(err => {
            console.error("Failed to cache quiz:", err);
        });

        return json.questions;
    } catch (error) {
        throw handleGeminiError(error, 'generating your quiz');
    }
}

export async function generateDiagnosticQuiz(classLevel: string, topics: Topic[], numberOfQuestions: number): Promise<Question[]> {
    const cacheKey = `diagnostic_quiz::${classLevel}::${numberOfQuestions}`;
    try {
        const cachedData = await getCachedContent(cacheKey);
        if (cachedData && cachedData.questions) {
            console.log("Cache hit for diagnostic quiz:", cacheKey);
            return cachedData.questions as Question[];
        }

        console.log("Cache miss for diagnostic quiz:", cacheKey);
        const topicsToSample = Math.min(topics.length, numberOfQuestions);
        const topicSubset = topics.sort(() => 0.5 - Math.random()).slice(0, topicsToSample);
        const topicNames = topicSubset.map(t => `"${t.name}" (ID: ${t.id})`).join(', ');

        const prompt = `
            You are an AI curriculum expert creating a diagnostic quiz for a Class ${classLevel} student in the Indian CBSE system.
            Your goal is to gauge the student's foundational knowledge across various subjects.

            Create a ${numberOfQuestions}-question multiple-choice quiz.
            - Each question must be from a **different topic** from the following list: ${topicNames}.
            - For each question, you MUST specify the original topic ID in the 'topic' field. This is crucial.
            - The questions should be fundamental, covering the most important concept from each topic.
            - For each question, provide 4 options, the correct answer, and a brief explanation.

            Return the quiz in JSON format.
        `;

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
                                    topic: { type: Type.STRING, description: "The original topic ID, e.g., 'algebra_basics_7'" },
                                },
                                required: ['id', 'questionText', 'options', 'correctAnswer', 'explanation', 'topic'],
                            },
                        },
                    },
                },
            },
        });

        const json = JSON.parse(response.text);
        
        setCachedContent(cacheKey, 'diagnostic_quiz', json).catch(err => {
            console.error("Failed to cache diagnostic quiz:", err);
        });

        return json.questions;
    } catch (error) {
        throw handleGeminiError(error, 'generating your diagnostic test');
    }
}

export async function analyzeDiagnosticResults(results: { question: Question; userAnswer: string }[]): Promise<{ strengths: string[]; weaknesses: string[] }> {
    try {
        const formattedResults = results.map(r => ({
            topic: r.question.topic,
            question: r.question.questionText,
            correct: r.userAnswer === r.question.correctAnswer,
        }));

        const prompt = `
            You are an AI educational analyst. A student has completed a diagnostic quiz.
            Based on their answers, identify their strength and weakness topics.

            The student's results are:
            ${JSON.stringify(formattedResults, null, 2)}

            Analyze the results:
            - A topic is a "weakness" if the student answered the question incorrectly.
            - A topic is a "strength" if the student answered the question correctly.

            Return a JSON object containing two arrays: 'strengths' and 'weaknesses'.
            Each array should contain the topic IDs (e.g., 'algebra_basics_7').
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        strengths: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Array of topic IDs where the student answered correctly."
                        },
                        weaknesses: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Array of topic IDs where the student answered incorrectly."
                        }
                    },
                    required: ['strengths', 'weaknesses']
                }
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        throw handleGeminiError(error, 'analyzing your results');
    }
}

export async function explainConcept(concept: string): Promise<string> {
    try {
        const prompt = `Explain the concept of "${concept}" in a simple and easy-to-understand way for a student.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        throw handleGeminiError(error, 'explaining the concept');
    }
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
    try {
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
    } catch (error) {
        if (error instanceof Error && error.message.includes("Image generation failed or returned no images.")) {
            throw new Error("The AI couldn't create an image for this prompt. Please try a different idea.");
        }
        throw handleGeminiError(error, "creating a visual aid");
    }
}

export async function generateStudyPlan(studentName: string, weaknesses: string[], strengths: string[], targetAudience: 'parent' | 'teacher'): Promise<string> {
    try {
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
    } catch (error) {
        throw handleGeminiError(error, 'creating the study plan');
    }
}

export async function generateFlashcards(content: string, topic: string, classLevel: string): Promise<{term: string, definition: string}[]> {
    const cacheKey = `flashcards::${topic.replace(/\s+/g, '_')}::${classLevel}`;
    try {
        const cachedData = await getCachedContent(cacheKey);
        if (cachedData && cachedData.flashcards) {
            console.log("Cache hit for flashcards:", cacheKey);
            return cachedData.flashcards as {term: string, definition: string}[];
        }
        
        console.log("Cache miss for flashcards:", cacheKey);
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
        
        setCachedContent(cacheKey, 'flashcards', json).catch(err => {
            console.error("Failed to cache flashcards:", err);
        });

        return json.flashcards;
    } catch (error) {
        throw handleGeminiError(error, 'creating flashcards');
    }
}

export async function generateEssayPrompt(topic: string, classLevel: string): Promise<string> {
    try {
        const prompt = `You are an exam setter for the Indian CBSE board. Generate one interesting and thought-provoking essay prompt on the topic of "${topic}" for a Class ${classLevel} student. The prompt should be a single, clear question or statement. Respond with only the prompt itself, without any extra text like "Here is a prompt:".`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'creating your essay prompt');
    }
}

export async function provideEssayFeedback(prompt: string, essay: string, classLevel: string): Promise<string> {
    try {
        const systemPrompt = `You are a helpful and encouraging English teacher for the Indian CBSE board. A Class ${classLevel} student has written an essay based on a prompt. Provide constructive feedback on their writing.

Your feedback must be:
1.  **Positive and Encouraging:** Start with a positive comment about what the student did well.
2.  **Structured:** Organize feedback into clear sections using markdown headings (e.g., ### Clarity and Structure, ### Grammar and Spelling, ### Suggestions for Improvement).
3.  **Actionable:** Provide specific examples from the student's text to illustrate your points.
4.  **Concise:** Keep the feedback focused and easy to digest.
5.  **AppropriATE:** The tone and complexity of the feedback should be suitable for a Class ${classLevel} student.

End with an encouraging summary.`;

        const userPrompt = `
**Prompt:** "${prompt}"

**Student's Essay:**
---
${essay}
---

Please provide feedback based on the criteria.`;

        const response = await ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
            },
        });
        
        return response.text;
    } catch (error) {
        throw handleGeminiError(error, 'analyzing your essay');
    }
}

export async function generateSummary(content: string, classLevel: string): Promise<string> {
    try {
        const prompt = `
            You are an expert at creating concise summaries for students.
            Summarize the following learning content for a Class ${classLevel} student in India.
            Focus on the key concepts and most important points.
            The summary should be clear, easy to understand, and presented in 2-3 short paragraphs or a few bullet points.

            Content to summarize:
            ---
            ${content}
            ---
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'creating a summary');
    }
}

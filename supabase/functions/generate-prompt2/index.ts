// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
console.log("Hello from generate-prompt edge function!");
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function generatePromptContent(difficulty: number, topic: string) {
  switch (difficulty) {
    case 1:
      return `Write a 40-50 word paragraph on ${topic}. Suitable for a 2nd grader, with no complicated words and punctuation besides periods.`;
    case 2:
      return `Write a 50-60 word paragraph on ${topic}. Suitable for a 4th grader, with no complicated words but slight punctuation allowed.`;
    case 3:
      return `Write a 50-60 word paragraph on ${topic}. Suitable for a 6th grader.`;
    case 4:
      return `Write a 50-60 word paragraph on ${topic}. Suitable for a 6th grader, with at least 5 punctuations that aren't periods (e.g., commas, dashes).`;
    case 5:
      return `Write a 60-70 word paragraph on ${topic}. Suitable for an 8th grader.`;
    case 6:
      return `Write a 60-70 word paragraph on ${topic}. Suitable for an 8th grader, with at least 3 SAT words of 7 characters or more.`;
    case 7:
      return `Write a 60-70 word paragraph on ${topic}. Suitable for a 10th grader, with at least 5 SAT words of 7 characters or more and multiple punctuations that aren't periods.`;
    case 8:
      return `Write a 70-80 word paragraph on ${topic}. In semi-academic language, include high-level language in at least 10 words.`;
    case 9:
      return `Write an 80-90 word paragraph on ${topic}. In academic language, include high-level language in at least 10 words and multiple punctuations that aren't periods.`;
    case 10:
      return `Write a 90-100 word paragraph on ${topic}. In academic language, include high-level language in at least 10 words, multiple punctuations that aren't periods, and something in quotation marks.`;
    default:
      return "Invalid difficulty level.";
  }
}

// Handle CORS preflight requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    const { id, customTopic, difficulty } = await req.json();
    if (!id || !customTopic || typeof difficulty !== "number") {
      return new Response("Missing or invalid required parameters", {
        headers: corsHeaders,
        status: 400,
      });
    }
    console.log("id", id);
    console.log("customTopic", customTopic);
    console.log("difficulty", difficulty);
    const promptContent = generatePromptContent(difficulty, customTopic);
    if (promptContent === "Invalid difficulty level.") {
      return new Response(promptContent, {
        headers: corsHeaders,
        status: 400,
      });
    }
    // Call OpenAI API to generate the prompt
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: promptContent,
          },
        ],
      }),
    });
    if (!response.ok) {
      return new Response("Error calling OpenAI API", {
        headers: corsHeaders,
        status: response.status,
      });
    }
    const data = await response.json();
    const generatedPrompt = data.choices[0]?.message?.content;
    if (!generatedPrompt) {
      return new Response("Failed to generate prompt", {
        headers: corsHeaders,
        status: 500,
      });
    }
    console.log("generatedPrompt", generatedPrompt);
    // Create Supabase client and update the game record with the generated prompt
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization"),
          },
        },
      },
    );
    const { data: updatedData, error } = await supabase.from("games").update({
      prompt: generatedPrompt,
    }).eq("id", id).select();
    console.log("updatedData", updatedData);
    if (error) {
      console.error("Database update error:", error);
      return new Response(
        JSON.stringify({
          error: error.message,
          generatedPrompt,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        },
      );
    }
    // Return the final response with both the generated prompt and updated data
    return new Response(
      JSON.stringify({
        message: generatedPrompt,
        data: updatedData,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error: " + String(error), {
      headers: corsHeaders,
      status: 500,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-prompt2' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"id":122, "customTopic": "monkeys", "difficulty": 5}'


    To invoke globally:

  curl -L -X POST 'https://umkaqxgnqgsvzngsgpeh.supabase.co/functions/v1/generate-prompt2' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta2FxeGducWdzdnpuZ3NncGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA3MjA5NDYsImV4cCI6MjAzNjI5Njk0Nn0.F2KBWbtCvdNNwfPG0PDetHymgh29_RQPpkASya_KVto' \
    -H 'Content-Type: application/json' \
    --data '{"id":122, "customTopic": "monkeys", "difficulty": 5}'


*/

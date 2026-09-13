const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_QUESTION_LENGTH = 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed.",
      },
      405
    );
  }

  try {
    const GEMINI_API_KEY =
      Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not configured."
      );
    }

    const body =
      await req.json();

    const question =
      String(
        body?.question || ""
      ).trim();

    if (!question) {
      return jsonResponse(
        {
          error:
            "Please provide a question.",
        },
        400
      );
    }

    if (
      question.length >
      MAX_QUESTION_LENGTH
    ) {
      return jsonResponse(
        {
          error:
            "Your question is too long.",
        },
        400
      );
    }

    /*
     * PHASE 1 PORTFOLIO CONTEXT
     *
     * We will replace this with dynamic
     * Supabase retrieval in the next phase.
     */

    const portfolioContext = `
You are the AI portfolio assistant for Md Mohaimenul Islam.

You must answer questions about the portfolio owner only from the information below.

PROFILE
- Electrical and Computer Engineering background.
- Currently studying a Master of Applied Artificial Intelligence (Professional) at Deakin University in Australia.
- Interested in artificial intelligence, machine learning, computer vision, NLP, deep learning, software engineering and research.

TECHNICAL EXPERIENCE
- Python
- PyTorch
- TensorFlow
- Computer Vision
- Deep Learning
- Natural Language Processing
- Machine Learning
- React
- JavaScript
- FastAPI
- Docker
- Git
- Supabase

PROJECTS AND RESEARCH

1. Project Orion
- AFL player tracking and crowd monitoring system.
- Work includes computer vision, player tracking, crowd analytics and dashboard development.
- Frontend uses React/Vite.
- Backend architecture includes FastAPI services.
- Docker is used for service orchestration.

2. C3 Creative Generation Research
- Research into enhancing creative generation for Stable Diffusion XL.
- Compares the original FFT-based C3 approach with wavelet and directional transform variants.
- Work includes DTCWT, NSST, WST, LPIPS and image-generation evaluation.
- Focus includes maintaining generation quality while improving creativity.

3. Tea Leaf Disease Classification
- Undergraduate research project.
- CNN-based tea leaf disease classification.
- Grad-CAM was used for model interpretability.

4. Information Retrieval / NLP
- Work using the SciFact dataset.
- Compared BM25, dense retrieval and hybrid retrieval.
- Developed an adaptive hybrid reranking method.

EDUCATION
- Bachelor of Science in Electrical and Computer Engineering from RUET, Bangladesh.
- Master of Applied Artificial Intelligence (Professional) at Deakin University, Australia.

INTERESTS
- Artificial intelligence
- Machine learning
- Computer vision
- NLP
- Research
- Software engineering
- Travelling
- Football

CONTACT
Visitors can use the Contact section of the portfolio to send a message.

RESPONSE RULES
1. Answer only questions related to the portfolio owner, projects, skills, education, research, experience or portfolio.
2. Do not invent qualifications, employers, publications, awards or technical skills.
3. If the requested information is not present, say that it is not currently available in the portfolio.
4. If asked unrelated general questions, politely explain that you are a portfolio assistant.
5. Keep answers concise and professional.
6. When useful, recommend which portfolio section or project the visitor should explore.
`;

    const prompt = `
${portfolioContext}

VISITOR QUESTION:
${question}

Answer the visitor's question based strictly on the portfolio information above.
`;

    /*
     * Gemini generateContent endpoint.
     */

    const response =
      await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              GEMINI_API_KEY,
          },

          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],

            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            },
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "Gemini API error:",
        data
      );

      return jsonResponse(
        {
          error:
            "The AI assistant is temporarily unavailable.",
        },
        500
      );
    }

    const answer =
      data?.candidates?.[0]
        ?.content?.parts
        ?.map(
          (part: {
            text?: string;
          }) =>
            part.text || ""
        )
        .join("")
        .trim();

    if (!answer) {
      return jsonResponse(
        {
          error:
            "The AI assistant could not generate an answer.",
        },
        500
      );
    }

    return jsonResponse({
      answer,
    });
  } catch (error) {
    console.error(
      "Portfolio AI function error:",
      error
    );

    return jsonResponse(
      {
        error:
          "The AI assistant is temporarily unavailable.",
      },
      500
    );
  }
});

function jsonResponse(
  data: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    }
  );
}
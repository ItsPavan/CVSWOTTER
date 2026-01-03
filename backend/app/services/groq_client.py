from groq import Groq
from app.config import GROQ_API_KEY
import json

class GroqClient:
    def __init__(self):
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"

    def analyze_resume(self, resume_text: str, jd_text: str):
        prompt = f"""
        You are an expert Resume ATS Scanner and Career Coach.
        
        Job Description:
        {jd_text}
        
        Resume Content:
        {resume_text}
        
        Analyze the resume against the JD. Provide a JSON response with the following structure:
        {{
            "match_score": <int 0-100>,
            "swot_analysis": {{
                "strengths": ["list of strings"],
                "weaknesses": ["list of strings"],
                "opportunities": ["list of strings"],
                "threats": ["list of strings"]
            }},
            "recommendations": [
                {{
                    "original": "<exact sentence from resume>",
                    "suggested": "<rewritten sentence optimized for ATS and impact>",
                    "reason": "<brief explanation>"
                }}
            ]
        }}
        Return ONLY valid JSON. Do not add markdown formatting like ```json.
        """
        
        completion = self.client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=self.model,
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        
        content = completion.choices[0].message.content
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Groq JSON Error. Raw content: {content}")
            # Fallback or re-raise with more info
            raise ValueError(f"Failed to parse AI response: {content[:100]}...")

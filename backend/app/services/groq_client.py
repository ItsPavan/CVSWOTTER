from groq import Groq
from app.config import GROQ_API_KEY
import json

class GroqClient:
    def __init__(self):
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"

    def analyze_resume(self, resume_text: str, jd_text: str):
        # Initial Zero Shot Prompt
        # prompt = f"""
        # You are an expert Resume ATS Scanner and Career Coach.
        #
        # Job Description:
        # {jd_text}
        #
        # Resume Content:
        # {resume_text}
        #
        # Analyze the resume against the JD. Provide a JSON response with the following structure:
        # {{
        #     "match_score": <int 0-100>,
        #     "swot_analysis": {{
        #         "strengths": ["list of strings"],
        #         "weaknesses": ["list of strings"],
        #         "opportunities": ["list of strings"],
        #         "threats": ["list of strings"]
        #     }},
        #     "recommendations": [
        #         {{
        #             "original": "<exact sentence from resume>",
        #             "suggested": "<rewritten sentence optimized for ATS and impact>",
        #             "reason": "<brief explanation>"
        #         }}
        #     ]
        # }}
        # Return ONLY valid JSON. Do not add markdown formatting like ```json.
        # """

        # ==========================================
        # 1. FEW-SHOT PROMPT (CURRENTLY DISABLED)
        # ==========================================
        # prompt = f"""
        # You are an expert Resume ATS Scanner and Career Coach.
        #
        # ### YOUR INSTRUCTIONS:
        # 1. **Analyze**: Identify critical hard skills, tools, and domain keywords in the JD that are missing or under-emphasized in the Resume.
        # 2. **Transform**: Rewrite specific bullet points to include these keywords naturally.
        # 3. **Quantify**: Always add metrics (%, $, time saved) where possible.
        # 4. **Action Verbs**: Start every bullet with a strong power verb.
        #
        # ### FEW-SHOT TRAINING EXAMPLES (LEARN THIS STYLE):
        #
        # === EXAMPLE 1: AI & DATA SCIENCE ===
        # JD Requires: "Experience with NLP, Transformers, and deploying models to production."
        # Original Bullet: "Used machine learning models for text analysis."
        # YOUR REWRITE: "Fine-tuned BERT-based Transformer models for NLP sentiment analysis and deployed inference pipelines via Docker, increasing prediction accuracy by 18%."
        #
        # === EXAMPLE 2: CYBERSECURITY ===
        # JD Requires: "Vulnerability assessment, SIEM tools (Splunk), and NIST compliance."
        # Original Bullet: "Monitored network security and checked for bugs."
        # YOUR REWRITE: "Conducted weekly vulnerability assessments using Nessus and monitored Splunk SIEM logs, reducing mean-time-to-detect (MTTD) threats by 40% in alignment with NIST frameworks."
        #
        # === EXAMPLE 3: MAINFRAME ===
        # JD Requires: "COBOL, JCL optimization, and DB2."
        # Original Bullet: "Maintained old code for banking system."
        # YOUR REWRITE: "Optimized legacy COBOL batch processing jobs and JCL scripts, reducing nightly batch run-time by 3 hours and ensuring 99.99% uptime for core banking DB2 transactions."
        #
        # === EXAMPLE 4: BUSINESS ANALYST ===
        # JD Requires: "Stakeholder management, Agile methodologies, and requirements gathering."
        # Original Bullet: "Talked to clients to get requirements."
        # YOUR REWRITE: "Facilitated requirements gathering workshops with 10+ cross-functional stakeholders using Agile methodologies, translating business needs into technical specs that reduced development rework by 15%."
        #
        # === END EXAMPLES ===
        #
        # ### INPUT DATA:
        # Job Description:
        # {jd_text}
        #
        # Resume Content:
        # {resume_text}
        #
        # ### OUTPUT REQUIREMENT:
        # Analyze the resume against the JD and return a valid JSON response with the following structure:
        # {{
        #     "match_score": <int 0-100>,
        #     "swot_analysis": {{
        #         "strengths": ["list of strings"],
        #         "weaknesses": ["list of strings"],
        #         "opportunities": ["list of strings"],
        #         "threats": ["list of strings"]
        #     }},
        #     "recommendations": [
        #         {{
        #             "original": "<exact sentence from resume>",
        #             "suggested": "<rewritten sentence optimized for ATS and impact>",
        #             "reason": "<brief explanation>"
        #         }}
        #     ]
        # }}
        #
        # **IMPORTANT:** Return ONLY valid JSON. Do not use Markdown formatting (like ```json). Do not add any conversational text.
        # """

        # ==========================================
        # 2. SINGLE-SHOT PROMPT (CURRENTLY DISABLED)
        # ==========================================
        # prompt = f"""
        # You are an expert Resume ATS Scanner and Career Coach.
        #
        # ### YOUR INSTRUCTION:
        # Analyze the provided Resume against the Job Description. Identify gaps and rewrite resume bullet points to better align with the JD keywords, using strong action verbs and metrics.
        #
        # ### ONE EXAMPLE TO FOLLOW:
        # JD Requires: "Cloud infrastructure management (AWS) and CI/CD."
        # Original Bullet: "Managed servers and deployment."
        # YOUR REWRITE: "Architected scalable AWS cloud infrastructure and implemented CI/CD pipelines using Jenkins, reducing deployment time by 50%."
        #
        # ### INPUT DATA:
        # Job Description:
        # {jd_text}
        #
        # Resume Content:
        # {resume_text}
        #
        # ### OUTPUT FORMAT:
        # Return a valid JSON object with: match_score (0-100), swot_analysis (strengths, weaknesses, opportunities, threats), and recommendations (original, suggested, reason).
        # Return ONLY valid JSON.
        # """

        # ==========================================
        # 3. CHAIN OF THOUGHT PROMPT (ACTIVE)
        # ==========================================
        prompt = f"""
        You are an expert Resume ATS Scanner and Career Coach. I want you to step-by-step analyze the resume against the job description to provide the most accurate optimization.

        ### STEP-BY-STEP REASONING PROCESS:
        1. **Analyze the JD**: First, identify the core hard skills, soft skills, and domain-specific tools required.
        2. **Analyze the Resume**: Look for where these skills appear or are missing in the resume. Note any weak or generic language.
        3. **Gap Analysis**: Compare the two. Where is the candidate strong? Where are the fatal flaws (missing keywords)? What specific metrics could be inferred or suggested to improve credibility?
        4. **Formulate Recommendations**: For every weak point identified, draft a rewrite that strictly mimics the high-impact style of top-tier resumes (Action Verb + Task + Result/Metric).
        5. **Final Output Generation**: Structure your findings into the requested JSON format.

        ### INPUT DATA:
        Job Description:
        {jd_text}

        Resume Content:
        {resume_text}

        ### OUTPUT REQUIREMENT:
        After performing your internal reasoning, output ONLY the final JSON result with the following structure:
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

        **IMPORTANT:** Return ONLY valid JSON. Do not include your internal reasoning trace in the final output, only the JSON.
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

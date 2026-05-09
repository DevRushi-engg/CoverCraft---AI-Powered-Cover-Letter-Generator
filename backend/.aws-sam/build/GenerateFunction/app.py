import json
import os
import uuid
import re
from datetime import datetime
import boto3

# Initialize clients
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'CoverCraftHistory')
table = dynamodb.Table(table_name)
bedrock = boto3.client('bedrock-runtime')

def lambda_handler(event, context):
    http_method = event.get('httpMethod')
    path = event.get('path')

    # Handle CORS preflight
    if http_method == 'OPTIONS':
        return _build_response(200, {})

    try:
        if http_method == 'POST' and path == '/generate':
            return handle_generate(event)
        elif http_method == 'GET' and path == '/history':
            return handle_history(event)
        else:
            return _build_response(404, {"error": "Not Found"})
    except Exception as e:
        print(f"Error handling request: {str(e)}")
        return _build_response(500, {"error": "Internal server error."})

def handle_generate(event):
    body = json.loads(event.get('body', '{}'))
    job_description = body.get('job_description')
    resume_text = body.get('resume_text')
    tone = body.get('tone', 'professional')

    if not job_description or not resume_text:
        return _build_response(400, {"error": "job_description and resume_text are required"})

    prompt = f"""You are an expert career coach and copywriter. Your task is to write a highly tailored cover letter based on the provided resume and job description.
    
The tone of the letter should be: {tone}.

Job Description:
<job_description>
{job_description}
</job_description>

Resume:
<resume>
{resume_text}
</resume>

Instructions:
1. Write a customized cover letter that connects the candidate's experience in the resume to the requirements in the job description. Do not use generic templates. Use the job description's language where appropriate.
2. CRITICAL LENGTH CONSTRAINT: The cover letter MUST be strictly between 250 and 400 words. It should be concise, highly readable, and structured into exactly 3 to 4 short paragraphs. Do not write excessively long letters.
3. Identify at least 3 "key matches" between the resume and the job description (e.g., "React + TypeScript", "Team leadership", "Scalable backend systems").
4. Output the result Strictly in JSON format without any other markdown formatting or conversational text as follows:
{{
  "cover_letter": "The full text of the cover letter...",
  "key_matches": ["match 1", "match 2", "match 3"]
}}
"""

    response = bedrock.converse(
        modelId='amazon.nova-lite-v1:0', # Amazon's modern first-party model (no CC required)
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        inferenceConfig={
            "maxTokens": 1500,
            "temperature": 0.7
        }
    )

    completion_text = response['output']['message']['content'][0]['text']

    # Try to parse JSON from the response text
    parsed_result = {}
    json_match = re.search(r'\{.*\}', completion_text, re.DOTALL)
    if json_match:
        try:
            parsed_result = json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass
            
    if not parsed_result:
        try:
            parsed_result = json.loads(completion_text)
        except Exception:
            # Fallback if claude output isn't exactly json
            return _build_response(500, {"error": "Failed to generate valid cover letter response.", "raw": completion_text})

    cover_letter = parsed_result.get('cover_letter', 'Error parsing cover letter.')
    key_matches = parsed_result.get('key_matches', [])

    # Save history to DynamoDB
    item_id = str(uuid.uuid4())
    record = {
        'id': item_id,
        'job_description_snippet': job_description[:100] + ('...' if len(job_description) > 100 else ''),
        'resume_text': resume_text,
        'tone': tone,
        'cover_letter': cover_letter,
        'key_matches': key_matches,
        'created_at': datetime.utcnow().isoformat() + 'Z'
    }
    
    try:
        table.put_item(Item=record)
    except Exception as e:
        print(f"Failed to write to DynamoDB: {str(e)}")
        # Continue returning the successful generation even if DB fails
        pass

    return _build_response(200, {
        "id": item_id,
        "cover_letter": cover_letter,
        "key_matches": key_matches
    })

def handle_history(event):
    try:
        response = table.scan(Limit=50)
        items = response.get('Items', [])
        # Sort history newest first
        items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return _build_response(200, items)
    except Exception as e:
        print(f"Error reading history: {str(e)}")
        return _build_response(500, {"error": "Failed to fetch history"})

def _build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": json.dumps(body)
    }

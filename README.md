<div align="center">

# ✏️ CoverCraft — AI-Powered Cover Letter Generator

### Generate perfectly tailored cover letters in seconds using Generative AI

[![AWS](https://img.shields.io/badge/AWS-Serverless-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Bedrock](https://img.shields.io/badge/Amazon_Bedrock-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/bedrock/)
[![DynamoDB](https://img.shields.io/badge/DynamoDB-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)

</div>

---

## 📸 Screenshots

<div align="center">

### Input Screen
*Paste your job description and resume, select a tone, and generate.*

![Input Screen]((https://github-production-user-asset-6210df.s3.amazonaws.com/84222209/589994196-1ae4eb21-e26c-4dac-8a8b-a41a01abd058.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20260509%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260509T145328Z&X-Amz-Expires=300&X-Amz-Signature=f41c9e234aa0f9d47095972a87a2ae28fdde3aca769f568deaabfbe30eff9ea7&X-Amz-SignedHeaders=host&response-content-type=image%2Fpng))

### Output Screen — AI Generated Cover Letter
*AI-generated cover letter with key skill matches and typewriter animation.*

![Output Screen](screenshots/output-screen.png)

### Generation with Key Matches
*Core focus areas automatically identified between your resume and the job description.*

![Key Matches](screenshots/key-matches.png)

### Generation History
*All previously generated cover letters stored and accessible anytime.*

![History Screen](screenshots/history-screen.png)

### System Architecture
*Complete serverless architecture on AWS.*

![Architecture Diagram](screenshots/architecture.png)

</div>

---

## 🚀 What is CoverCraft?

CoverCraft is a **full-stack serverless web application** that uses **Amazon Bedrock's Nova Lite AI model** to generate professional, tailored cover letters. Users paste a job description and their resume, select a writing tone, and receive a perfectly customized 250–400 word cover letter — complete with identified skill matches between their resume and the job requirements.

### ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI-Powered Generation** | Uses Amazon Bedrock (Nova Lite v1) to generate context-aware cover letters |
| 🎯 **Skill Match Analysis** | Automatically identifies 3+ key matches between resume and job description |
| 🎨 **Three Tone Options** | Professional, Startup, or Formal — tailored writing styles |
| ⌨️ **Typewriter Animation** | Cover letter appears character-by-character with a blinking cursor |
| 📋 **One-Click Copy** | Copy the generated letter to clipboard instantly |
| 📥 **Download as .txt** | Download the cover letter as a text file |
| 📜 **Generation History** | All past letters saved to DynamoDB and accessible via History screen |
| 🌙 **Premium Dark UI** | Sleek dark theme with amber accents and smooth animations |
| ⚡ **Fully Serverless** | Zero servers to manage — scales automatically, costs ~$0 at idle |

---

## 🏗️ System Architecture

```
┌──────────┐   HTTPS    ┌─────────────┐   Invoke   ┌──────────────┐
│  React   │ ────────→  │ API Gateway │ ────────→  │    Lambda    │
│  Browser │ ←────────  │   (Router)  │ ←────────  │  (Python)   │
└──────────┘   JSON     └─────────────┘   Result   └──────┬───────┘
                                                          │
                                          ┌───────────────┼───────────────┐
                                          ▼                               ▼
                                   ┌──────────┐                   ┌──────────┐
                                   │ Bedrock  │                   │ DynamoDB │
                                   │ Nova Lite│                   │ Database │
                                   │ (Gen AI) │                   │ (NoSQL)  │
                                   └──────────┘                   └──────────┘
```

### Request Flow

1. **User** pastes job description + resume and clicks "Generate"
2. **React Frontend** sends POST request to API Gateway
3. **API Gateway** routes the request to Lambda
4. **Lambda** builds an AI prompt and calls Amazon Bedrock
5. **Bedrock (Nova Lite)** generates a tailored cover letter in JSON format
6. **Lambda** parses the response, saves to DynamoDB, returns to frontend
7. **React** displays the letter with a typewriter animation

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI component framework |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS styling |
| **Framer Motion** | Animations and screen transitions |
| **Lucide React** | SVG icon components |
| **Vite** | Build tool and dev server |

### Backend (AWS Serverless)
| Service | Purpose |
|---|---|
| **AWS Lambda** | Serverless compute — runs Python code on demand |
| **Amazon API Gateway** | REST API — public HTTPS endpoint |
| **Amazon Bedrock** | Managed AI service — hosts Nova Lite model |
| **Amazon DynamoDB** | NoSQL database — stores generation history |
| **AWS IAM** | Security — least-privilege permissions |
| **AWS SAM** | Infrastructure-as-Code deployment |

---

## 📁 Project Structure

```
CoverCraft/
├── src/
│   ├── App.tsx              # Main application (all screens + logic)
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles + font imports
│   └── utils.ts             # Tailwind class merge utility
│
├── backend/
│   ├── src/
│   │   ├── app.py           # Lambda handler (AI + DB logic)
│   │   └── requirements.txt # Python dependencies (boto3)
│   └── template.yaml        # AWS infrastructure definition
│
├── index.html               # HTML shell
├── .env                     # API URL (not committed)
├── tailwind.config.js       # Custom theme configuration
├── vite.config.ts           # Vite build configuration
└── package.json             # Frontend dependencies
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v18+ and npm
- **Python** 3.12+
- **AWS CLI** configured with credentials
- **AWS SAM CLI** installed
- **AWS Bedrock** access enabled for Amazon Nova Lite model

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/CoverCraft.git
cd CoverCraft
```

### 2. Deploy the Backend
```bash
cd backend
sam build
sam deploy --guided
```
Note the **API URL** from the output.

### 3. Configure the Frontend
Create a `.env` file in the root:
```env
VITE_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
```

### 4. Install & Run Frontend
```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Security

- **IAM Least Privilege** — Lambda can only access its own DynamoDB table and Bedrock
- **CORS** — Configured at both API Gateway and Lambda response level
- **No secrets in code** — API URL stored in `.env` (gitignored)
- **Input validation** — Lambda validates required fields before processing

---

## 📊 Performance & Cost

| Metric | Value |
|---|---|
| End-to-end response time | 4–7 seconds |
| AI generation time | 3–5 seconds |
| Cover letter length | 250–400 words |
| Lambda memory | 256 MB |
| Lambda timeout | 30 seconds |
| **Monthly cost (low traffic)** | **~$0.02** |

---

## 🧠 AI & Prompt Engineering

CoverCraft uses a **5-layer prompt structure**:

1. **Role Assignment** — "You are an expert career coach and copywriter"
2. **Tone Specification** — Professional / Startup / Formal
3. **Context Injection** — Full JD and resume wrapped in XML tags
4. **Length Constraints** — Strictly 250–400 words, 3–4 paragraphs
5. **Output Format** — JSON only with `cover_letter` and `key_matches`

Model: **Amazon Nova Lite v1:0** | Temperature: **0.7** | Max Tokens: **1500**

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ using AWS Serverless & Amazon Bedrock**

</div>

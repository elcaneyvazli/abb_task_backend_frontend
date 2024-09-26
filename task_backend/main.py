from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import shutil
import os
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores.faiss import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import TextLoader
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from langchain.chat_models import ChatOpenAI

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
   
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    content: str
    filename: str
    
class ScrapeRequest(BaseModel):
    url: str  

UPLOAD_DIRECTORY = "uploaded_files"

os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

def create_vector_db(file_path):
    loader = TextLoader(file_path)
    documents = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(documents)
    
    embeddings = OpenAIEmbeddings()
    
    vector_store = FAISS.from_documents(docs, embeddings)
    
    return vector_store

def create_qa_chain():
    llm = ChatOpenAI(temperature=0.5, model_name="gpt-4o-mini")
    
    qa_prompt = PromptTemplate(
        template="""Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Answer:""",
        input_variables=["context", "question"]
    )

    qa_chain = load_qa_chain(llm, chain_type="stuff", prompt=qa_prompt)
    
    return qa_chain

def run_qa_system(file_path, user_prompt):
    vector_db = create_vector_db(file_path)
    qa_chain = create_qa_chain()
    
    docs = vector_db.similarity_search(user_prompt)
    
    result = qa_chain({"input_documents": docs, "question": user_prompt})
    
    return result["output_text"]

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_location = f"{UPLOAD_DIRECTORY}/{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
                
        return JSONResponse(content={
            "filename": file.filename,
            "status": "File uploaded successfully"
        }, status_code=200)
    except Exception as e:
        return JSONResponse(content={
            "error": str(e),
            "status": "Failed to upload file"
        }, status_code=500)

@app.post("/ask")
async def ask(message: Message):
    try:
        file_path = f"{UPLOAD_DIRECTORY}/{message.filename}"
        user_prompt = message.content
    
        answer = run_qa_system(file_path, user_prompt)
        print(f"Answer: {answer}")
        return {
            "answer": answer,
        }
    except Exception as e:
        return JSONResponse(content={
            "error": str(e),
            "status": "Failed to process message"
        }, status_code=500)


def scrape_website(url: str, page_limit: int = 30):
    parsed_url = urlparse(url)
    if not bool(parsed_url.scheme) or not bool(parsed_url.netloc):
        raise ValueError("Invalid URL provided")

    def clean_text(soup):
        unwanted_tags = ['script', 'style', 'noscript', 'meta', 'link']
        for tag in unwanted_tags:
            for element in soup.find_all(tag):
                element.decompose()
        
        ignored_sections = ['header', 'footer', 'nav', 'aside']
        for section in ignored_sections:
            for element in soup.find_all(section):
                for child in element.find_all(text=True):
                    child.extract()

        return ' '.join(text.strip() for text in soup.stripped_strings if text)

    visited_urls = set()
    text_elements = []
    page_count = 0

    def scrape_page(url):
        nonlocal page_count

        if page_count >= page_limit:
            return

        try:
            response = requests.get(url)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error scraping {url}: {str(e)}")
            return

        soup = BeautifulSoup(response.content, 'html.parser')
        clean_page_text = clean_text(soup)

        print(f"Scraping URL: {url}, extracted text length: {len(clean_page_text)}")

        page_count += 1
        
        if clean_page_text:
            text_elements.append(clean_page_text)

        base_url = url
        for link in soup.find_all('a', href=True):
            link_url = urljoin(base_url, link['href'])
            if link_url not in visited_urls and link_url.startswith(parsed_url.scheme + '://' + parsed_url.netloc):
                visited_urls.add(link_url)
                scrape_page(link_url)

    visited_urls.add(url)
    scrape_page(url)

    return '\n'.join(text_elements)

@app.post("/scrape")
async def scrape_text(request: ScrapeRequest):
    try:
        url = request.url
        scraped_content = scrape_website(url)
        
        if not scraped_content:
            raise HTTPException(status_code=404, detail="No text found in the provided URL")
        
        filename = f"scraped_content_{len(os.listdir(UPLOAD_DIRECTORY))}.txt"
        file_path = os.path.join(UPLOAD_DIRECTORY, filename)
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(scraped_content)
        
        return JSONResponse(content={
            "message": "Text successfully scraped and written to file",
            "filename": filename,
            "content": scraped_content
        }, status_code=200)
    except ValueError as ve:
        return JSONResponse(content={
            "error": str(ve),
            "status": "Failed to scrape website"
        }, status_code=400)
    except Exception as e:
        return JSONResponse(content={
            "error": str(e),
            "status": "Failed to scrape website"
        }, status_code=500)
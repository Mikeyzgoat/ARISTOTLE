from fastapi import APIRouter,Depends, UploadFile
from fastapi.responses import Response
from httpx import ResponseNotRead
import ollama
from pydantic import BaseModel
from typing import Optional
import json
from PIL import Image
import io
import aiofiles
import asyncio
import uvicorn
import requests
from hashlib import sha256
import bcrypt as bc
import os
from dotenv import load_dotenv
import base64
import ngrok
# ngrok static domain
# ngrok http --domain=osprey-amazing-tightly.ngrok-free.app 80
# instantiate the LLM LLaVa
load_dotenv()

class ChatTemplate(BaseModel):
    username:str
    prompt:str
    images:Optional[bytes]=None
    
class AuthTemplate(BaseModel):
    username:str
    password:Optional[str]=None
    
class ImageTemplate(BaseModel):
    username:str
    images:bytes
    image_id:str 
    
class ChatHistoryTemplate(BaseModel):
    username:str
    chathistory:list

# encryption and hashing phase
salt = os.getenv("SALT")
# Text to image api key
STABLE_DIFFUSION_KEY = os.getenv("STABLE_DIFFUSION_API_KEY")
IMAGE_CAPTIONING_API_KEY=os.getenv("IMAGE_CAPTIONING_API_KEY")


# 3 prompt templates 
"""
1 - captions only
2 - objects only
3 - VQA
"""

# create database access,i.e JSON FILE

#instantiate api
app= APIRouter()

@app.post("/userlogin/")
def user_login_validate(request:AuthTemplate):
    with open("data.json","r") as f:
        dt = json.load(f)
    
    if request.username in dt["users"]:
        y = [i[j] for i in dt["credentials"] for j in i if j ==request.username]
        x= bc.checkpw(request.password.encode("utf-8"), y[0].encode("utf-8"))
        return {"response":x}

@app.post("/createnewuser/")
def create_new_user(request:AuthTemplate):
    # append data into the database
    with open("data.json","r") as f:
        dt = json.load(f)
    if request.username in dt["users"]:
        return {"response":"username already exists"}
    else:
        with open("data.json","w") as f:
            dt["users"]+= [request.username]
            dt["chathistory"]+=[{request.username:[]}]
            dt["imgIdandcaptions"]+=[{request.username:[]}]
            # hashing 
            hash_string_pass = bc.hashpw(request.password.encode("utf-8"),salt=salt.encode("utf-8"))
            hash_string_pass=hash_string_pass.decode('utf-8')
            dt["credentials"]+=[{request.username:hash_string_pass}]
            json.dump(dt,f,indent=4)
    return {"status":200}
        
@app.post("/storechathistory")
def store_chat_history(data:ChatHistoryTemplate):
    with open("data.json","r") as f:
        dt = json.load(f)
    messages = [i[j] for i in dt["chathistory"] for j in i if j ==data.username][0]
    messages.append(data.chathistory)
    with open("data.json","w") as f:
        json.dump(dt,f,indent=4)
    return {"response":"done"}
        
       
@app.get("/fetchchathistory/{username}")
def fetch_chat_history(username:str):
    with open("data.json","r") as f:
        dt = json.load(f)
        x = [i[j] for i in dt["chathistory"] for j in i if j ==username]  
        return x[0]


@app.post("/api/generateimagecaption")
def generate_image_caption(req:ImageTemplate):   
    API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
    headers = {"Authorization": f"Bearer {IMAGE_CAPTIONING_API_KEY}"}
    response = requests.post(API_URL,headers=headers,data=req.images)
    return response.json()
    

@app.post("/api/visualqa/")
def visualqa(req:ChatTemplate): # handle images and text generation based on previous queries by users
    with open("data.json","r") as f:
        dt = json.load(f)
    messages = [i[j] for i in dt["chathistory"] for j in i if j ==req.username][0]
    messages.append({"role":"user","content":req.prompt})
    result = ollama.chat(model="aristotle:latest",messages=messages)
    messages.append(result["message"])
    with open("data.json","w") as f:
        json.dump(dt,f,indent=4)
    return {"response":messages}

# text to image( in bytes )
@app.post("/texttoimage/")
def text_to_image(req:ChatTemplate):
    API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
    headers = {"Authorization": f"Bearer {STABLE_DIFFUSION_KEY}"}
    response = requests.post(API_URL,headers=headers,json={"inputs":req.prompt,})
    return Response(content=response.content,media_type="image/png")

# handle langchain chains

# store the chain details in a json file 

if "__name__" == "__main__":
    uvicorn.run(app,host='127.0.0.1',port=8000)
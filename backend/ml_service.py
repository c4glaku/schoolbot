import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow logging
import sys
import json
import tensorflow as tf
import tensorflow_datasets as tfds
import tensorflow_hub as hub
import numpy as np
import traceback
from openai import OpenAI
from PyPDF2 import PdfReader
import requests
import unicodedata
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import anthropic
import time
import hashlib

processed_texts_cache = {}

def get_cached_or_process(file_path, process_func):
    file_hash = hashlib.md5(open(file_path, 'rb').read()).hexdigest()
    if file_hash in processed_texts_cache:
        return processed_texts_cache[file_hash]
    result = process_func(file_path)
    processed_texts_cache[file_hash] = result
    return result

# Load Universal Sentence Encoder
embed = hub.load("https://tfhub.dev/google/universal-sentence-encoder/4")
# replace with valid keys

# Initialize API Clients
openai_client = OpenAI(
    api_key='',
    )

anthropic_client = anthropic.Client(api_key='')


def extract_text_from_file(file_path):
    if file_path.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    else:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            return file.read()

def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()
    return text

def prepare_data():
    try:
        dataset, info = tfds.load('imdb_reviews', with_info=True, as_supervised=True)
        train_dataset = dataset['train'].take(5000)  # Using 5000 examples for faster processing
        examples = []
        for text, label in train_dataset:
            # Normalize and encode the text, removing non-ASCII characters
            text = ''.join(char for char in unicodedata.normalize('NFKD', text.numpy().decode('utf-8')) if ord(char) < 128)
            examples.append({
                'text': text,
                'label': 'positive' if label.numpy() == 1 else 'negative'
            })
        print(f"Loaded {len(examples)} examples from IMDB reviews dataset", file=sys.stderr)
        return examples
    except Exception as e:
        print(f"Error loading IMDB reviews dataset: {str(e)}", file=sys.stderr)
        return None



'''Failed to make this model work
def prepare_wikipedia_data():
    try:
        dataset = tfds.load('wikipedia/20230601.en', split='train', as_supervised=True)
        examples = []
        for text, title in dataset.take(1000):  # Reduced to 1000 examples for faster processing
            examples.append({
                'text': text.numpy().decode('utf-8'),
                'label': title.numpy().decode('utf-8').split('/')[0]
            })
        print(f"Loaded {len(examples)} examples from Wikipedia dataset", file=sys.stderr)
        return examples
    except Exception as e:
        print(f"Error loading Wikipedia dataset: {str(e)}", file=sys.stderr)
        return None
'''


def build_and_train_model(training_data):
    if not training_data:
        print("No training data available. Skipping model training.", file=sys.stderr)
        return None, None
    texts = [item['text'] for item in training_data]
    labels = list(set(item['label'] for item in training_data))
    label_encoder = {label: i for i, label in enumerate(labels)}

    embeddings = embed(texts)
    y = np.array([label_encoder[item['label']] for item in training_data])

    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=(embeddings.shape[1],)),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(len(labels), activation='softmax')
    ])

    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    
    print("Starting model training...", file=sys.stderr)
    try:
        history = model.fit(embeddings, y, epochs=5, validation_split=0.2, verbose=1)
        print(f"Model training completed. Final accuracy: {history.history['accuracy'][-1]:.2f}", file=sys.stderr)
    except Exception as e:
        print(f"Error during model training: {str(e)}", file=sys.stderr)
        return None, None

    return model, labels

def predict_topics(text, model, labels):
    if model is None or labels is None:
        print("Model or labels are None. Cannot predict topics.", file=sys.stderr)
        return "Unknown"
    embedding = embed([text])
    prediction = model.predict(embedding)
    return labels[np.argmax(prediction)]

def generate_descriptions(text, model, labels, max_descriptions=20):
    sentences = [s.strip() for s in text.split('.') if s.strip()]
    
    if len(sentences) <= max_descriptions:
        topics = [predict_topics(sentence, model, labels) for sentence in sentences]
        return [{'sentence': sentence, 'topic': topic} for sentence, topic in zip(sentences, topics)]
    
    # If we have more sentences than max_descriptions, use TF-IDF and K-means clustering
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(sentences)
    
    kmeans = KMeans(n_clusters=max_descriptions, random_state=42)
    kmeans.fit(tfidf_matrix)
    
    # Find the sentences closest to the cluster centers
    closest_sentences = []
    for cluster_idx in range(max_descriptions):
        cluster_sentences = [s for s, c in zip(sentences, kmeans.labels_) if c == cluster_idx]
        cluster_tfidf = tfidf_matrix[kmeans.labels_ == cluster_idx]
        
        if len(cluster_sentences) > 0:
            centroid = kmeans.cluster_centers_[cluster_idx]
            distances = np.linalg.norm(cluster_tfidf - centroid, axis=1)
            closest_idx = distances.argmin()
            closest_sentences.append(cluster_sentences[closest_idx])
    
    topics = [predict_topics(sentence, model, labels) for sentence in closest_sentences]
    return [{'sentence': sentence, 'topic': topic} for sentence, topic in zip(closest_sentences, topics)]

def rate_limited_api_call(func, *args, **kwargs):
    max_retries = 5
    for i in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if 'insufficient_quota' in str(e) or 'rate_limit_exceeded' in str(e):
                if i < max_retries - 1:
                    time.sleep(2 ** i)  # Exponential backoff
                    continue
            raise e


# for testing when gpt-turbo reaches daily quota
def generate_simple_questions(descriptions, question_type, difficulty, num_questions):
    questions = []
    for i in range(int(num_questions)):
        description = descriptions[i % len(descriptions)]
        question = f"{difficulty.capitalize()} {question_type} question about {description['topic']}: What is the main idea of '{description['sentence']}'?"
        questions.append(question)
    return questions

def generate_questions_with_gpt(descriptions, question_type, difficulty, num_questions):
    try:
        prompt = f"Generate {num_questions} {difficulty} {question_type} questions based on the following descriptions:\n\n"
        prompt += '\n'.join(f"{d['sentence']} (Topic: {d['topic']})" for d in descriptions)
            
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates educational questions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150 * int(num_questions)
        )

        return response.choices[0].message['content'].strip().split('\n')
    except Exception as e:
        print(f"Error generating questions with GPT: {str(e)}", file=sys.stderr)
        print("Falling back to simple question generation", file=sys.stderr)
        return generate_simple_questions(descriptions, question_type, difficulty, num_questions)
    

def generate_questions_with_claude(descriptions, question_type, difficulty, num_questions):
    try:
        all_questions = []
        batch_size = 5
        num_questions = int(num_questions)
        for i in range(0, len(descriptions), batch_size):
            batch = descriptions[i:i+batch_size]
            questions_per_batch = max(1, num_questions // len(descriptions) * len(batch))
            prompt = f"Generate {questions_per_batch} {difficulty} {question_type} questions based on the following descriptions:\n\n"
            prompt += '\n'.join(f"{d['sentence']} (Topic: {d['topic']})" for d in batch)
            
            response = rate_limited_api_call(
                anthropic_client.completions.create,
                model="claude-2.1",
                max_tokens_to_sample=150 * questions_per_batch,
                prompt=f"{anthropic.HUMAN_PROMPT} {prompt}{anthropic.AI_PROMPT}"
            )

            batch_questions = response.completion.strip().split('\n')
            all_questions.extend(batch_questions)
            
            if len(all_questions) >= num_questions:
                break

        return all_questions[:num_questions]
    
    except Exception as e:
        print(f"Error generating questions with Claude: {str(e)}", file=sys.stderr)
        print("Falling back to simple question generation", file=sys.stderr)
        return generate_simple_questions(descriptions, question_type, difficulty, num_questions)


if __name__ == "__main__":
    try:
        file_path, question_type, difficulty, num_questions = sys.argv[1:]
        print(f"Received file path: {file_path}", file=sys.stderr)
        print(f"Current working directory: {os.getcwd()}", file=sys.stderr)
        print(f"File exists: {os.path.exists(file_path)}", file=sys.stderr)
        print(f"File size: {os.path.getsize(file_path)} bytes", file=sys.stderr)
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file {file_path} does not exist.")
        
        text = get_cached_or_process(file_path, extract_text_from_file)
        print(f"Extracted text length: {len(text)} characters", file=sys.stderr)
        
        training_data = prepare_data()
        model, labels = build_and_train_model(training_data)
        
        if model is None or labels is None:
            print("Model training failed. Using default processing.", file=sys.stderr)
            descriptions = [{'sentence': s, 'topic': 'General'} for s in text.split('.') if s.strip()][:20]  # Limit to 20 descriptions
        else:
            descriptions = generate_descriptions(text, model, labels, max_descriptions=20)
        
        print(f"Generated {len(descriptions)} descriptions", file=sys.stderr)
        questions = generate_questions_with_gpt(descriptions, question_type, difficulty, num_questions)
        # questions = generate_questions_with_claude(descriptions, question_type, difficulty, num_questions)
        
        # Print the JSON output to stdout
        print("JSON_OUTPUT_START")
        print(json.dumps(questions))
        
        print("JSON_OUTPUT_END")
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        print("Traceback:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
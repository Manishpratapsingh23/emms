from sentence_transformers import SentenceTransformer
import os

# Define the path exactly where you want it
model_path = os.path.join(os.getcwd(), "model_cache", "all-MiniLM-L6-v2")

# Download and save
print("Downloading and saving model to local storage...")
model = SentenceTransformer('all-MiniLM-L6-v2')
model.save(model_path)
print(f"Done! Model saved at: {model_path}")
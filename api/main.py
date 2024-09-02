from fastapi import FastAPI,File,UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from keras.layers import TFSMLayer
app=FastAPI()
origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_layer = TFSMLayer('../models/1', call_endpoint='serving_default')
input_shape = (256, 256, 3)
inputs = tf.keras.Input(shape=input_shape)
outputs = model_layer(inputs)
MODEL = tf.keras.Model(inputs=inputs, outputs=outputs)


CLASS_NAMES=['Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy']

@app.get("/ping")
async def ping():
    return "Hello,I am alive"
def read_file_as_image(data) -> np.ndarray:
    try:
        image = Image.open(BytesIO(data))
        image = image.convert("RGB").resize((256, 256))
        return np.array(image)
    except Exception as e:
        raise ValueError("Error reading image file.") from e

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):
    try:

        image = read_file_as_image(await file.read())

        img_batch = np.expand_dims(image, 0)
        predictions = MODEL(img_batch)


        if isinstance(predictions, dict):
            predictions = predictions.get('output_0')
        if isinstance(predictions, tf.Tensor):
            predictions = predictions.numpy()
        elif not isinstance(predictions, np.ndarray):
            raise ValueError("Unexpected type of model predictions.")

        print(predictions)


        predicted_class_idx = np.argmax(predictions[0])

        predicted_class = CLASS_NAMES[predicted_class_idx]
        confidence = np.max(predictions[0])

        return {"class": predicted_class, "confidence": float(confidence)}

    except Exception as e:
        print(f"Error occurred: {e}")
        return {"error": str(e)}


if __name__=="__main__":
    uvicorn.run(app,host='localhost',port=8000)
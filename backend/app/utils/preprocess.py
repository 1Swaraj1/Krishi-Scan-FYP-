import numpy as np
from tensorflow.keras.preprocessing import image
#from tensorflow.keras.utils import img_to_array, load_img

from PIL import Image

def preprocess_image(img: Image.Image, target_size=(128, 128)):
    """
    Preprocess image for model prediction
    - Resize to target_size
    - Convert to array
    - Scale to [0,1]
    - Expand dims to match model input
    """
    img = img.resize(target_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    return img_array

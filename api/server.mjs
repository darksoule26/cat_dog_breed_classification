import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Client } from '@gradio/client';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files from the public directory
app.use(express.static('public'));

// Define the prediction endpoint
app.post('/predict', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Read the uploaded image
        const imageBuffer = fs.readFileSync(req.file.path);

        // Connect to the Gradio client
        const client = await Client.connect("darksoule26/cat_and_dog_classification");

        // Make the prediction request
        const result = await client.predict("/predict", { 
            image: new Blob([imageBuffer], { type: req.file.mimetype })
        });

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        // Send the response
        if (result && result.data && Array.isArray(result.data)) {
            res.json({ breed: result.data[0] });
        } else {
            res.status(500).json({ error: 'Unexpected response from the classification model.' });
        }
    } catch (error) {
        console.error('Error during prediction:', error);
        res.status(500).json({ error: 'An error occurred while processing the image.', details: error.message });
    }
});

// Export the app instance for Vercel serverless deployment
export default app;

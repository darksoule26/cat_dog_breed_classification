import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Client } from '@gradio/client';

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 3000;

app.use(express.static('public'));

app.post('/predict', upload.single('image'), async (req, res) => {
    console.log('Received prediction request');
    try {
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        console.log('File uploaded:', req.file.path);

        let client;
        try {
            console.log('Connecting to Gradio client');
            client = await Client.connect("darksoule26/cat_and_dog_classification");
            console.log('Connected to Gradio client');
        } catch (error) {
            console.error('Error connecting to Gradio client:', error);
            return res.status(500).json({ error: 'Unable to connect to the classification model.' });
        }

        const imageBuffer = fs.readFileSync(req.file.path);
        console.log('Image read from file');

        let result;
        try {
            console.log('Sending prediction request to Gradio');
            result = await client.predict("/predict", { 
                image: new Blob([imageBuffer], { type: req.file.mimetype })
            });
            console.log('Received prediction result:', result);
        } catch (error) {
            console.error('Error during prediction:', error);
            return res.status(500).json({ error: 'Error during image classification.' });
        }

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
        console.log('Temporary file deleted');

        if (result && result.data && Array.isArray(result.data)) {
            console.log('Sending successful response');
            res.json({ breed: result.data[0] }); // Send breed directly
        } else {
            console.log('Unexpected response format:', result);
            res.status(500).json({ error: 'Unexpected response from the classification model.' });
        }
    } catch (error) {
        console.error('Unhandled error:', error);
        res.status(500).json({ error: 'An error occurred while processing the image.', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Test the Gradio client connection
(async () => {
    try {
        const client = await Client.connect("darksoule26/cat_and_dog_classification");
        console.log('Successfully connected to Gradio client');
    } catch (error) {
        console.error('Error testing Gradio client connection:', error);
    }
})();

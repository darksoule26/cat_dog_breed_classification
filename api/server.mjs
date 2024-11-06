import { Client } from '@gradio/client';
import multer from 'multer';
import fs from 'fs';

// Set up multer to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Define the Vercel API handler for the POST request
export default async function handler(req, res) {
    if (req.method === 'POST') {
        console.log('Received prediction request');
        
        // Handle no file uploaded
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Log the uploaded file path
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

        // Read the uploaded file
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

        // Check if the response is in the expected format
        if (result && result.data && Array.isArray(result.data)) {
            console.log('Sending successful response');
            res.json({ breed: result.data[0] });
        } else {
            console.log('Unexpected response format:', result);
            res.status(500).json({ error: 'Unexpected response from the classification model.' });
        }
    } else {
        // Handle other HTTP methods
        res.status(405).json({ error: 'Method not allowed' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-form');
    const resultDiv = document.getElementById('result');
    const breedResult = document.getElementById('breed-result');
    const loadingDiv = document.getElementById('loading');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        resultDiv.classList.add('hidden');
        loadingDiv.classList.remove('hidden');

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            loadingDiv.classList.add('hidden');
            resultDiv.classList.remove('hidden');
            
            if (data && data[0] && data[0].label) {
                breedResult.textContent = `Your pet is likely a ${data[0].label}`;
            } else {
                breedResult.textContent = 'Unable to identify the breed. Please try another image.';
            }
        } catch (error) {
            console.error('Error:', error);
            loadingDiv.classList.add('hidden');
            resultDiv.classList.remove('hidden');
            breedResult.textContent = 'An error occurred. Please try again.';
        }
    });
});
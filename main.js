// OPENAI configuration
const OPENAI = {
    API_BASE_URL: 'https://api.openai.com/v1',
    // API_KEY: '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',
    API_KEY: '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',
    GPT_MODEL: 'gpt-3.5-turbo',
    API_COMPLETIONS: '/chat/completions',
    API_IMAGE: '/images/generations',
};

// Store elements in variables
const ingredients = document.querySelectorAll('.ingredient');
const bowlSlots = document.querySelectorAll('.bowl-slot');
const cookBtn = document.querySelector('#cook-btn');
const loading = document.querySelector('.loading');
const loadingMessage = document.querySelector('.loading-message');
const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal-content');
const modalImage = document.querySelector('.modal-image');
const modalCloseBtn = document.querySelector('.modal-close');

// Init bowl state
let bowl = [];

// Create recipe event
cookBtn.addEventListener('click', createRecipe);

// Modal close event
modalCloseBtn.addEventListener('click', function () {
    modal.classList.add('hidden');
});

// Ingredient click event
ingredients.forEach(function (el) {
    el.addEventListener('click', function () {
        addIngredient(el.innerText);
    });
});

// function definitions
function addIngredient(ingredient) {
    
    console.log(ingredient);
    console.log(bowl);
    
    const bowlMaxSlots = bowlSlots.length;
    
    if (bowl.length === bowlMaxSlots) {
        bowl.shift();
    }
    
    bowl.push(ingredient);
    
    bowlSlots.forEach(function (el, i) {
        let ingredient = '?';
        
        if (bowl[i]) {
            ingredient = bowl[i];
        }
        
        el.innerText = ingredient;
    });
    
    if (bowl.length === bowlMaxSlots) {
        cookBtn.classList.remove('hidden');
    }
}

async function createRecipe() {
    loading.classList.remove('hidden');
    loadingMessage.innerText = getRandomLoadingMessage();

    const messageInterval = setInterval(() => {
        loadingMessage.innerText = getRandomLoadingMessage();
    }, 2000);

    const prompt = `\
Crea una ricetta con questi ingredienti: ${bowl.join(', ')}.
La ricetta deve rispettare i gusti della cucina italiana e deve avere un titolo creativo e divertente.
Le tue risposte sono solo in formato JSON come questo esempio:

###

{
    "titolo": "Titolo ricetta",
    "ingredienti": "1 uovo e 1 pomodoro",
    "istruzioni": "Mescola gli ingredienti e metti in forno"
}

###`;

    const recipeResponse = await makeRequest(OPENAI.API_COMPLETIONS, {
        model: OPENAI.GPT_MODEL,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7
    });

    const content = JSON.parse(recipeResponse.choices[0].message.content);

    modalContent.innerHTML = `\
<h2>${content.titolo}</h2>
<p>${content.ingredienti}</p>
<p>${content.istruzioni}</p>`;

    modal.classList.remove('hidden');
    loading.classList.add('hidden');
    clearInterval(messageInterval)

    const imageResponse = await makeRequest(OPENAI.API_IMAGE, {
        prompt: `Crea una immagine per questa ricetta: ${content.titolo}`,
        n: 1,
        size: '512x512',
    });

    const imageUrl = imageResponse.data[0].url;
    modalImage.innerHTML = `<img src="${imageUrl}" alt="foto ricetta" />`
    clearBowl();
}

function clearBowl() {
    bowl = [];

    bowlSlots.forEach(function (slot) {
        slot.innerText = '?';
    });
}

function getRandomLoadingMessage() { 
    const messages = [
        'Preparo gli ingredienti...',
        'Scaldo i fornelli...',
        'Mescolo nella ciotola...',
        'Scatto foto per Instagram...',
        'Prendo il mestolo...',
        'Metto il grembiule...',
        'Mi lavo le mani...',
        'Tolgo le bucce...',
        'Pulisco il ripiano...'
    ];

    const randIdx = Math.floor(Math.random() * messages.length);
    return messages[randIdx];
}

async function makeRequest(endpoint, data) {
    const response = await fetch(OPENAI.API_BASE_URL + endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI.API_KEY}`,
        },
        method: 'POST',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json;
}

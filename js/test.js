// Test.html JavaScript funkciók

// LocalStorage kulcsok
const STORAGE_KEY = 'ascension_workouts';
const USER_DATA_KEY = 'ascension_user_data';
const PLAN_KEY = 'ascension_current_plan';

// Aktuális edzésterv gyakorlatai
let currentExercises = [];

// Oldal betöltésekor
document.addEventListener('DOMContentLoaded', () => {
    // Tárolt felhasználói adatok betöltése
    loadUserData();
    
    // Tárolt edzésterv betöltése
    loadSavedPlan();
});

// Felhasználói adatok mentése
function saveUserData() {
    const userData = {
        age: document.getElementById('age').value,
        weight: document.getElementById('weight').value,
        height: document.getElementById('height').value,
        gender: document.getElementById('gender').value,
        activity: document.getElementById('activity').value,
        goal: document.getElementById('goal').value,
        experience: document.getElementById('experience').value
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

// Felhasználói adatok betöltése
function loadUserData() {
    const saved = localStorage.getItem(USER_DATA_KEY);
    if (saved) {
        const userData = JSON.parse(saved);
        document.getElementById('age').value = userData.age || '';
        document.getElementById('weight').value = userData.weight || '';
        document.getElementById('height').value = userData.height || '';
        document.getElementById('gender').value = userData.gender || '';
        document.getElementById('activity').value = userData.activity || '';
        document.getElementById('goal').value = userData.goal || '';
        document.getElementById('experience').value = userData.experience || '';
    }
}

// Kalória és edzésterv generálás
function calculateAndGenerate() {
    // Input értékek
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const gender = document.getElementById('gender').value;
    const activity = parseFloat(document.getElementById('activity').value);
    const goal = document.getElementById('goal').value;
    const experience = document.getElementById('experience').value;

    // Validáció
    if (!age || !weight || !height || !gender || !activity || !goal || !experience) {
        alert('Kérlek töltsd ki az összes mezőt!');
        return;
    }

    // Adatok mentése
    saveUserData();

    // BMR kalkuláció (Mifflin-St Jeor formula)
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activity;

    // Cél kalória
    let goalCalories;
    let goalText;
    switch(goal) {
        case 'deficit':
            goalCalories = tdee - 500; // 500 kcal deficit
            goalText = 'Fogyás (-500 kcal)';
            break;
        case 'maintain':
            goalCalories = tdee;
            goalText = 'Tartás (fenntartó)';
            break;
        case 'surplus':
            goalCalories = tdee + 300; // 300 kcal többlet
            goalText = 'Tömegnövelés (+300 kcal)';
            break;
    }

    // Makrók számítás
    const protein = weight * 2.2; // 2.2g / kg testsúly
    const proteinCal = protein * 4;
    
    const fat = weight * 1; // 1g / kg testsúly
    const fatCal = fat * 9;
    
    const carbCal = goalCalories - proteinCal - fatCal;
    const carb = carbCal / 4;

    // Eredmények megjelenítése
    document.getElementById('bmr-value').textContent = `${Math.round(bmr)} kcal`;
    document.getElementById('tdee-value').textContent = `${Math.round(tdee)} kcal`;
    document.getElementById('goal-value').textContent = `${Math.round(goalCalories)} kcal (${goalText})`;
    
    document.getElementById('protein-value').textContent = `Fehérje: ${Math.round(protein)}g (${Math.round(proteinCal)} kcal)`;
    document.getElementById('fat-value').textContent = `Zsír: ${Math.round(fat)}g (${Math.round(fatCal)} kcal)`;
    document.getElementById('carb-value').textContent = `Szénhidrát: ${Math.round(carb)}g (${Math.round(carbCal)} kcal)`;
    
    document.getElementById('calorie-result').style.display = 'block';

    // Edzésterv generálás
    generateTrainingPlan(experience, goal);
    
    // Smooth scroll az eredményekhez
    document.getElementById('calorie-result').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Edzésterv generálás tapasztalat és cél alapján
function generateTrainingPlan(experience, goal) {
    const planContainer = document.getElementById('plan-container');
    let plan = '';
    let exercises = [];

    if (experience === 'beginner') {
        exercises = ['Guggolás', 'Fekvenyomás', 'Húzódzkodás', 'Vállnyomás', 'Evezés'];
        plan = `
            <div class="plan-card">
                <h4>Kezdő Fullbody Program (3x/hét)</h4>
                <div class="day-plan">
                    <h5>Hétfő/Szerda/Péntek:</h5>
                    <ul>
                        <li>Guggolás: 3x8-10</li>
                        <li>Fekvenyomás: 3x8-10</li>
                        <li>Húzódzkodás/Lat pulldown: 3x8-10</li>
                        <li>Vállnyomás: 3x10-12</li>
                        <li>Evezés: 3x10-12</li>
                    </ul>
                </div>
                <p class="plan-note">💡 Fókuszálj a technikára, növeld fokozatosan a súlyokat.</p>
            </div>
        `;
    } else if (experience === 'intermediate') {
        exercises = ['Fekvenyomás', 'Húzódzkodás', 'Vállnyomás', 'Evezés', 'Guggolás', 'Romániai felhúzás'];
        plan = `
            <div class="plan-card">
                <h4>Haladó Upper/Lower Split (4x/hét)</h4>
                <div class="day-plan">
                    <h5>Hétfő/Csütörtök - Felső:</h5>
                    <ul>
                        <li>Fekvenyomás: 4x6-8</li>
                        <li>Húzódzkodás: 4x6-8</li>
                        <li>Vállnyomás: 3x8-10</li>
                        <li>Evezés: 3x8-10</li>
                    </ul>
                </div>
                <div class="day-plan">
                    <h5>Kedd/Szombat - Alsó:</h5>
                    <ul>
                        <li>Guggolás: 4x6-8</li>
                        <li>Romániai felhúzás: 3x8-10</li>
                    </ul>
                </div>
                <p class="plan-note">💡 Progressive overload minden héten!</p>
            </div>
        `;
    } else { // advanced
        exercises = ['Fekvenyomás', 'Ferde fekvenyomás', 'Vállnyomás', 'Felhúzás', 'Húzódzkodás', 'T-bar evezés', 'Guggolás', 'Lábtoló', 'Romániai felhúzás'];
        plan = `
            <div class="plan-card">
                <h4>Profi Push/Pull/Legs (6x/hét)</h4>
                <div class="day-plan">
                    <h5>Hétfő/Csütörtök - Push:</h5>
                    <ul>
                        <li>Fekvenyomás: 4x5-6</li>
                        <li>Ferde fekvenyomás: 4x8-10</li>
                        <li>Vállnyomás: 4x8-10</li>
                    </ul>
                </div>
                <div class="day-plan">
                    <h5>Kedd/Péntek - Pull:</h5>
                    <ul>
                        <li>Felhúzás: 4x5-6</li>
                        <li>Húzódzkodás: 4x8-10</li>
                        <li>T-bar evezés: 4x8-10</li>
                    </ul>
                </div>
                <div class="day-plan">
                    <h5>Szerda/Szombat - Legs:</h5>
                    <ul>
                        <li>Guggolás: 4x5-6</li>
                        <li>Lábtoló: 4x10-12</li>
                        <li>Romániai felhúzás: 4x8-10</li>
                    </ul>
                </div>
                <p class="plan-note">💡 Változtasd a gyakorlatokat 4-6 hetente!</p>
            </div>
        `;
    }

    // Cél specifikus tanácsok
    let goalAdvice = '';
    if (goal === 'deficit') {
        goalAdvice = '<p class="goal-advice">🔥 Fogyás: Tartsd meg az erődet, fókuszálj a technikára.</p>';
    } else if (goal === 'surplus') {
        goalAdvice = '<p class="goal-advice">💪 Tömegnövelés: Progresszíven növeld a súlyokat!</p>';
    } else {
        goalAdvice = '<p class="goal-advice">⚖️ Tartás: Tartsd az erőszinted.</p>';
    }

    planContainer.innerHTML = plan + goalAdvice;
    document.getElementById('training-plan').style.display = 'block';
    
    // Mentés és tracker generálás
    currentExercises = exercises;
    localStorage.setItem(PLAN_KEY, JSON.stringify({ exercises, experience, goal }));
    generateExerciseInputs(exercises);
    document.getElementById('tracker-section').style.display = 'block';
    loadWorkouts();
}

// Gyakorlat input mezők generálása
function generateExerciseInputs(exercises) {
    const container = document.getElementById('exercise-inputs');
    let html = '<div class="exercise-input-grid">';
    
    exercises.forEach(exercise => {
        html += `
            <div class="exercise-input-item">
                <label>${exercise}</label>
                <input type="number" 
                       id="weight-${exercise.replace(/\s+/g, '-')}" 
                       placeholder="Súly (kg)" 
                       min="0" 
                       step="2.5"
                       class="weight-input">
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Edzés session mentése
function saveWorkoutSession() {
    const today = new Date().toISOString().split('T')[0];
    const sessionData = [];
    let hasData = false;

    currentExercises.forEach(exercise => {
        const inputId = `weight-${exercise.replace(/\s+/g, '-')}`;
        const weightInput = document.getElementById(inputId);
        const weight = parseFloat(weightInput.value);

        if (weight && weight > 0) {
            hasData = true;
            sessionData.push({
                id: Date.now() + Math.random(),
                exercise,
                weight,
                date: today
            });
        }
    });

    if (!hasData) {
        alert('Adj meg legalább egy gyakorlat súlyát!');
        return;
    }

    // Mentés
    let workouts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    workouts.push(...sessionData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));

    // Input mezők törlése
    currentExercises.forEach(exercise => {
        const inputId = `weight-${exercise.replace(/\s+/g, '-')}`;
        document.getElementById(inputId).value = '';
    });

    // Lista frissítése
    loadWorkouts();

    alert('Edzés sikeresen mentve! 💪');
}

// Edzések betöltése és megjelenítése
function loadWorkouts() {
    const workouts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const workoutList = document.getElementById('workout-list');

    if (workouts.length === 0) {
        workoutList.innerHTML = '<p class="no-data">Még nincsenek rögzített edzések.</p>';
        return;
    }

    // Rendezés dátum szerint (legújabb első)
    workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Csoportosítás gyakorlat szerint
    const grouped = {};
    workouts.forEach(w => {
        if (!grouped[w.exercise]) {
            grouped[w.exercise] = [];
        }
        grouped[w.exercise].push(w);
    });

    let html = '';
    for (const [exercise, records] of Object.entries(grouped)) {
        html += `<div class="exercise-group">`;
        html += `<h5>${exercise}</h5>`;
        html += `<div class="progress-chart">`;
        
        records.forEach((w, index) => {
            const isNew = index === 0;
            const improvement = index < records.length - 1 
                ? ((w.weight - records[index + 1].weight) / records[index + 1].weight * 100).toFixed(1)
                : null;

            html += `
                <div class="workout-entry ${isNew ? 'latest' : ''}">
                    <div class="workout-info">
                        <span class="workout-date">${formatDate(w.date)}</span>
                        <span class="workout-details">${w.weight}kg</span>
                        ${improvement !== null && improvement > 0 
                            ? `<span class="improvement">↗ +${improvement}%</span>` 
                            : improvement !== null && improvement < 0 
                            ? `<span class="decline">↘ ${improvement}%</span>`
                            : improvement === 0
                            ? `<span class="neutral">→ 0%</span>`
                            : ''}
                    </div>
                    <button class="btn-delete" onclick="deleteWorkout(${w.id})">🗑️</button>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }

    workoutList.innerHTML = html;
}

// Edzés törlése
function deleteWorkout(id) {
    if (!confirm('Biztosan törlöd ezt az edzést?')) return;

    let workouts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    workouts = workouts.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    loadWorkouts();
}

// Mentett terv betöltése
function loadSavedPlan() {
    const savedPlan = localStorage.getItem(PLAN_KEY);
    if (savedPlan) {
        const { exercises } = JSON.parse(savedPlan);
        currentExercises = exercises;
        generateExerciseInputs(exercises);
        document.getElementById('tracker-section').style.display = 'block';
        loadWorkouts();
    }
}

// Dátum formázás
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['jan', 'feb', 'már', 'ápr', 'máj', 'jún', 'júl', 'aug', 'szep', 'okt', 'nov', 'dec'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

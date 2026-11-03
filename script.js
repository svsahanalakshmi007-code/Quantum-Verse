
const $ = id => document.getElementById(id);
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

let learner = store.get("qvLearner", "");
let completed = store.get("qvCompleted", []);
let bestScore = store.get("qvBest", 0);
let gateCount = store.get("qvGateCount", 0);

const lessons = [
  {title:"Qubit",icon:"◉",level:"BEGINNER",desc:"Discover the basic unit of quantum information.",intro:"A qubit is the basic unit of quantum information. Unlike a classical bit, which is either 0 or 1, a qubit can be in a quantum superposition of basis states.",sections:[
    ["What is a qubit?","A qubit is a two-level quantum system. Its state can be represented as |ψ⟩ = α|0⟩ + β|1⟩."],
    ["Probability","The probability of measuring 0 is |α|². The probability of measuring 1 is |β|². These probabilities add up to 1."],
    ["Example","An equal superposition has α = 1/√2 and β = 1/√2, so both outcomes have 50% probability."]
  ]},
  {title:"Superposition",icon:"✧",level:"BEGINNER",desc:"Understand how quantum states combine.",intro:"Superposition means a quantum system can be described as a combination of possible basis states.",sections:[
    ["Mathematical form","|+⟩ = (|0⟩ + |1⟩) / √2."],
    ["Why it matters","It allows quantum algorithms to use interference between probability amplitudes."],
    ["Example","Applying a Hadamard gate to |0⟩ creates an equal superposition."]
  ]},
  {title:"Measurement",icon:"◎",level:"BEGINNER",desc:"Learn how quantum states produce outcomes.",intro:"Quantum measurement returns a classical result from a quantum state.",sections:[
    ["Born rule","The probability of an outcome is the squared magnitude of its amplitude."],
    ["Single measurement","One measurement returns one result, not both 0 and 1."],
    ["Repeated measurements","Repeating an experiment helps estimate the probability distribution."]
  ]},
  {title:"Quantum Gates",icon:"⌘",level:"INTERMEDIATE",desc:"Explore operations that transform qubits.",intro:"Quantum gates are unitary operations that change quantum states while preserving total probability.",sections:[
    ["Pauli-X","The X gate swaps |0⟩ and |1⟩."],
    ["Pauli-Z","The Z gate changes the phase of the |1⟩ component."],
    ["Hadamard","The H gate creates superposition from computational basis states."]
  ]},
  {title:"Entanglement",icon:"∞",level:"INTERMEDIATE",desc:"Explore correlations between quantum systems.",intro:"Entanglement is a quantum property in which multiple systems share a joint state that cannot be described as independent states.",sections:[
    ["Bell state","|Φ+⟩ = (|00⟩ + |11⟩) / √2."],
    ["Correlations","When measured in the computational basis, this Bell state gives matching results: 00 or 11."],
    ["Important note","Entanglement does not allow faster-than-light communication."]
  ]},
  {title:"Quantum Algorithms",icon:"⟁",level:"ADVANCED",desc:"Discover Grover and Shor algorithm concepts.",intro:"Quantum algorithms use quantum operations to solve computational problems.",sections:[
    ["Grover's algorithm","Grover's search provides a quadratic speedup for unstructured search."],
    ["Shor's algorithm","Shor's algorithm uses quantum period finding for integer factorization."],
    ["Learning demo","The demonstrations on this website are simplified educational simulations."]
  ]}
];

function showPage(id) {
  const page = $(id);
  if (!page) return;
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  page.classList.add("active");
  document.querySelectorAll(".nav-link").forEach(a => {
    a.classList.toggle("active", a.dataset.page === id);
  });
  history.replaceState(null, "", "#" + id);
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll("[data-page]").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});
document.querySelectorAll("[data-go]").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.go));
});
window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if ($(id)?.classList.contains("page")) showPage(id);
});
if ($(location.hash.slice(1))?.classList.contains("page")) {
  showPage(location.hash.slice(1));
}

function updateDashboard() {
  const percent = Math.round(completed.length / lessons.length * 100);
  $("completedCount").textContent = completed.length;
  $("gateCount").textContent = gateCount;
  $("bestScore").textContent = bestScore + "/10";
  $("progressPercent").textContent = percent + "%";
  $("progressLarge").textContent = percent + "%";
  $("progressBar").style.width = percent + "%";
  $("progressMessage").textContent = percent === 100
    ? "Amazing! You completed all learning modules."
    : `${completed.length} of ${lessons.length} learning modules completed.`;
  $("sideName").textContent = learner || "Quantum Learner";
  $("topName").textContent = learner || "Sign in";
}

function renderLessons() {
  $("lessonGrid").innerHTML = lessons.map((lesson, i) => `
    <article class="lesson-card" data-search="${lesson.title.toLowerCase()} ${lesson.desc.toLowerCase()}">
      <div class="lesson-icon">${lesson.icon}</div>
      <small>${lesson.level} · MODULE ${String(i+1).padStart(2,"0")}</small>
      <h3>${lesson.title}</h3>
      <p>${lesson.desc}</p>
      <button data-open-lesson="${i}">${completed.includes(lesson.title) ? "✓ Completed · Review →" : "Start lesson →"}</button>
    </article>`).join("");

  document.querySelectorAll("[data-open-lesson]").forEach(btn => {
    btn.addEventListener("click", () => openLesson(Number(btn.dataset.openLesson)));
  });
}

let currentLesson = 0;

function openLesson(index) {
  currentLesson = index;
  const lesson = lessons[index];
  $("lessonGrid").style.display = "none";
  $("lessonSearch").style.display = "none";
  $("lessonView").classList.add("open");
  $("lessonTag").textContent = lesson.level + " LEARNING MODULE";
  $("lessonTitle").textContent = lesson.title;
  $("lessonIntro").textContent = lesson.intro;
  $("lessonBody").innerHTML = lesson.sections.map((s, i) =>
    `<h3>${i+1}. ${s[0]}</h3><p class="muted">${s[1]}</p>`
  ).join("");
  $("completeLesson").textContent = completed.includes(lesson.title)
    ? "✓ Completed" : "Mark completed ✓";
  $("prevLesson").disabled = index === 0;
  $("nextLesson").disabled = index === lessons.length - 1;
  window.scrollTo({top:0,behavior:"smooth"});
}

function closeLesson() {
  $("lessonView").classList.remove("open");
  $("lessonGrid").style.display = "grid";
  $("lessonSearch").style.display = "flex";
}
$("backLessons").addEventListener("click", closeLesson);
$("prevLesson").addEventListener("click", () => {
  if (currentLesson > 0) openLesson(currentLesson - 1);
});
$("nextLesson").addEventListener("click", () => {
  if (currentLesson < lessons.length - 1) openLesson(currentLesson + 1);
});
$("completeLesson").addEventListener("click", () => {
  const name = lessons[currentLesson].title;
  if (!completed.includes(name)) {
    completed.push(name);
    store.set("qvCompleted", completed);
    updateDashboard();
    renderLessons();
    $("completeLesson").textContent = "✓ Completed";
  }
});
$("lessonSearch").addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll(".lesson-card").forEach(card => {
    card.style.display = card.dataset.search.includes(query) ? "" : "none";
  });
});
document.querySelectorAll("[data-lesson]").forEach(btn => {
  btn.addEventListener("click", () => {
    showPage("learn");
    openLesson(lessons.findIndex(l => l.title === btn.dataset.lesson));
  });
});

// ACCOUNT PROFILE
$("loginBtn").addEventListener("click", () => {
  $("learnerName").value = learner;
  $("loginModal").classList.add("open");
});
$("closeLogin").addEventListener("click", () => $("loginModal").classList.remove("open"));
$("loginModal").addEventListener("click", e => {
  if (e.target === $("loginModal")) $("loginModal").classList.remove("open");
});
$("saveProfile").addEventListener("click", () => {
  const name = $("learnerName").value.trim();
  if (!name) return alert("Please enter your name.");
  learner = name;
  store.set("qvLearner", learner);
  $("loginModal").classList.remove("open");
  updateDashboard();
});

// THEME
$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  store.set("qvLight", document.body.classList.contains("light"));
});
if (store.get("qvLight", false)) document.body.classList.add("light");

// QUBIT PLAYGROUND
function updateQubit() {
  const theta = Number($("theta").value);
  const phi = Number($("phi").value);
  const radians = theta * Math.PI / 180;
  const p0 = Math.cos(radians / 2) ** 2;
  const p1 = Math.sin(radians / 2) ** 2;
  $("thetaValue").textContent = theta + "°";
  $("phiValue").textContent = phi + "°";
  $("pZero").textContent = (p0 * 100).toFixed(1) + "%";
  $("pOne").textContent = (p1 * 100).toFixed(1) + "%";
  $("pZeroBar").style.width = p0 * 100 + "%";
  $("pOneBar").style.width = p1 * 100 + "%";
  const a = Math.cos(radians / 2);
  const b = Math.sin(radians / 2);
  $("stateText").textContent =
    `|ψ⟩ = ${a.toFixed(3)}|0⟩ + ${b.toFixed(3)}e^(${phi}°i)|1⟩`;
}
$("theta").addEventListener("input", updateQubit);
$("phi").addEventListener("input", updateQubit);
$("measureBtn").addEventListener("click", () => {
  const p0 = Math.cos(Number($("theta").value) * Math.PI / 360) ** 2;
  const outcome = Math.random() < p0 ? "0" : "1";
  $("measureResult").textContent = `Measurement result: |${outcome}⟩`;
});
$("resetQubit").addEventListener("click", () => {
  $("theta").value = 0;
  $("phi").value = 0;
  updateQubit();
  $("measureResult").textContent = "Qubit reset to |0⟩.";
});

// SINGLE-QUBIT GATE SIMULATOR
let a = {re:1,im:0}, b = {re:0,im:0}, circuit = [];
const add = (x,y) => ({re:x.re+y.re,im:x.im+y.im});
const mul = (x,y) => ({re:x.re*y.re-x.im*y.im,im:x.re*y.im+x.im*y.re});
const neg = x => ({re:-x.re,im:-x.im});
const scale = (x,n) => ({re:x.re*n,im:x.im*n});
const mag2 = x => x.re*x.re+x.im*x.im;
function applyGate(g) {
  const oldA = a, oldB = b, s = 1 / Math.sqrt(2);
  if (g === "X") { a=oldB; b=oldA; }
  if (g === "Y") {
    a={re:oldB.im,im:-oldB.re};
    b={re:-oldA.im,im:oldA.re};
  }
  if (g === "Z") { a=oldA; b=neg(oldB); }
  if (g === "H") {
    a=scale(add(oldA,oldB),s);
    b=scale(add(oldA,neg(oldB)),s);
  }
  circuit.push(g);
  gateCount++;
  store.set("qvGateCount",gateCount);
  updateGateDisplay();
  updateDashboard();
}
function complexText(x) {
  return `${x.re.toFixed(2)} ${x.im < 0 ? "-" : "+"} ${Math.abs(x.im).toFixed(2)}i`;
}
function updateGateDisplay() {
  $("circuitGates").innerHTML = circuit.length
    ? circuit.map(g => `<span class="gate-chip">${g}</span>`).join("")
    : "Initial state |0⟩";
  $("gateState").textContent = `|ψ⟩ = (${complexText(a)})|0⟩ + (${complexText(b)})|1⟩`;
  $("gateProb").textContent = `P(0) = ${(mag2(a)*100).toFixed(1)}% · P(1) = ${(mag2(b)*100).toFixed(1)}%`;
}
document.querySelectorAll("[data-gate]").forEach(btn => {
  btn.addEventListener("click", () => applyGate(btn.dataset.gate));
});
$("resetGates").addEventListener("click", () => {
  a={re:1,im:0}; b={re:0,im:0}; circuit=[];
  updateGateDisplay();
});

// BELL STATE MEASUREMENT
let bell = {total:0,zero:0,one:0};
function updateBell() {
  $("bellTotal").textContent = bell.total;
  $("bell00").textContent = bell.zero;
  $("bell11").textContent = bell.one;
  $("bellBar00").style.width = (bell.total ? bell.zero/bell.total*100 : 0) + "%";
  $("bellBar11").style.width = (bell.total ? bell.one/bell.total*100 : 0) + "%";
}
$("bellMeasure").addEventListener("click", () => {
  const outcome = Math.random() < .5 ? "00" : "11";
  bell.total++;
  if (outcome === "00") bell.zero++; else bell.one++;
  $("bellResult").textContent = `Measurement result: |${outcome}⟩`;
  updateBell();
});
$("bellReset").addEventListener("click", () => {
  bell={total:0,zero:0,one:0};
  $("bellResult").textContent = "Waiting for measurement...";
  updateBell();
});

// GROVER SEARCH DEMONSTRATION
$("runGrover").addEventListener("click", () => {
  const target = Number($("groverTarget").value);
  let state = [.5,.5,.5,.5];
  state[target] *= -1;
  const mean = state.reduce((sum,x)=>sum+x,0)/4;
  state = state.map(x => 2*mean-x);
  const probabilities = state.map(x=>x*x);
  $("groverResult").textContent =
    `Target item ${target}: ${(probabilities[target]*100).toFixed(1)}% simulated probability.`;
  $("groverBars").innerHTML = probabilities.map((p,i) =>
    `<div class="bar-row"><span>Item ${i}</span><div class="progress-track"><div style="width:${p*100}%"></div></div><strong>${(p*100).toFixed(0)}%</strong></div>`
  ).join("");
});

// SMALL INTEGER FACTOR DEMONSTRATION
$("factorBtn").addEventListener("click", () => {
  const n = Number($("factorInput").value);
  if (!Number.isInteger(n) || n<4 || n>100) {
    $("factorResult").textContent = "Enter a whole number between 4 and 100.";
    return;
  }
  for(let i=2;i<=Math.sqrt(n);i++) {
    if(n%i===0) {
      $("factorResult").textContent = `${n} = ${i} × ${n/i}`;
      return;
    }
  }
  $("factorResult").textContent = `${n} is prime. No non-trivial factors found.`;
});

// KNOWLEDGE QUIZ
const questions = [
  ["What is the basic unit of quantum information?",["Bit","Qubit","Byte","Pixel"],1],
  ["Which gate creates equal superposition from |0⟩?",["X","Z","H","Y"],2],
  ["Which gate flips |0⟩ and |1⟩?",["X","H","Z","S"],0],
  ["What does measurement produce?",["Only a graph","A classical outcome","A new qubit","A gate"],1],
  ["What is the Bell state |Φ+⟩?",["(|00⟩+|11⟩)/√2","|01⟩","|00⟩","|11⟩"],0],
  ["What is P(0) in an equal superposition?",["0%","25%","50%","100%"],2],
  ["Which algorithm is used for quantum search?",["Grover","Bubble sort","Dijkstra","Merge sort"],0],
  ["Which algorithm is associated with factoring?",["Grover","Shor","BFS","DFS"],1],
  ["What does a Hadamard gate create from |0⟩?",["A bit flip","Equal superposition","A measurement","Entanglement"],1],
  ["Does entanglement allow faster-than-light communication?",["Yes","No","Always","Only sometimes"],1]
];
let qIndex=0, score=0, answered=false, quizFinished=false;

function showQuestion() {
  const q=questions[qIndex];
  $("questionCount").textContent=`Question ${qIndex+1} / ${questions.length}`;
  $("quizScore").textContent=`Score: ${score}`;
  $("questionText").textContent=q[0];
  $("quizBar").style.width=(qIndex/questions.length*100)+"%";
  $("answerFeedback").textContent="Choose your answer.";
  $("nextQuestion").disabled=true;
  $("nextQuestion").textContent=qIndex===questions.length-1?"See result →":"Next question →";
  $("answerList").innerHTML="";
  q[1].forEach((option,i)=>{
    const btn=document.createElement("button");
    btn.className="answer-option";
    btn.textContent=option;
    btn.addEventListener("click",()=>chooseAnswer(i,btn));
    $("answerList").appendChild(btn);
  });
  answered=false;
}
function chooseAnswer(index,button) {
  if(answered || quizFinished)return;
  answered=true;
  const correct=questions[qIndex][2];
  document.querySelectorAll(".answer-option").forEach((btn,i)=>{
    btn.disabled=true;
    if(i===correct)btn.classList.add("correct");
  });
  if(index===correct) {
    score++;
    $("answerFeedback").textContent="Correct answer! Great work.";
  } else {
    button.classList.add("wrong");
    $("answerFeedback").textContent="Not quite. The correct answer is: "+questions[qIndex][1][correct];
  }
  $("quizScore").textContent=`Score: ${score}`;
  $("nextQuestion").disabled=false;
}
function finishQuiz() {
  quizFinished=true;
  $("questionCount").textContent="Quiz completed";
  $("questionText").textContent=`Your score: ${score} / ${questions.length}`;
  $("answerList").innerHTML="";
  $("quizBar").style.width="100%";
  $("answerFeedback").textContent=score>=6?"Congratulations! You passed the quiz.":"Keep practising and try again!";
  $("nextQuestion").disabled=true;
  $("quizFinal").textContent=score>=6?"✓ Learning achievement unlocked!":"You need 6 correct answers to pass.";
  if(score>bestScore) {
    bestScore=score;
    store.set("qvBest",bestScore);
    updateDashboard();
  }
}
$("nextQuestion").addEventListener("click",()=>{
  if(!answered || quizFinished)return;
  qIndex++;
  if(qIndex===questions.length)finishQuiz();
  else showQuestion();
});
$("restartQuiz").addEventListener("click",()=>{
  qIndex=0;score=0;answered=false;quizFinished=false;
  $("quizFinal").textContent="";
  showQuestion();
});

// INITIAL PAGE SETUP
renderLessons();
updateDashboard();
updateQubit();
updateGateDisplay();
updateBell();
showQuestion();

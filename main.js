class MemoryGame{
constructor(){
this.cards=[];
this.flippedCards=[];
this.matchedPairs=0;
this.moves=0;
this.score=0;
this.streak=0;
this.maxStreak=0;
this.startTime=null;
this.timerInterval=null;
this.isGameActive=false;
this.isPaused=false;
this.hintsLeft=3;
this.currentDifficulty='easy';
this.multiplier=1;
this.emojiSets={
animals:['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦'],
food:['🍎','🍌','🍊','🍇','🍓','🥝','🍑','🍒','🥭','🍍','🥥','🥑','🍅','🥕','🌽','🥒','🥬','🥦'],
nature:['🌸','🌺','🌻','🌷','🌹','🌿','🍀','🌱','🌳','🌲','🌴','🌵','🌾','🌼','💐','🌙','⭐','☀️'],
objects:['⚽','🏀','🏈','⚾','🎾','🏐','🏓','🏸','🥅','🎯','🎮','🎲','🎸','🎹','🎺','🎻','🎪','🎭']
};
this.difficulties={
easy:{rows:4,cols:4,pairs:8,timeBonus:10,scoreMultiplier:1},
medium:{rows:4,cols:6,pairs:12,timeBonus:15,scoreMultiplier:1.5},
hard:{rows:6,cols:6,pairs:18,timeBonus:20,scoreMultiplier:2}
};
this.initializeElements();
this.loadLeaderboard();
this.init();
}
initializeElements(){
this.gameBoard=document.getElementById('gameBoard');
this.timerElement=document.getElementById('timer');
this.movesElement=document.getElementById('moves');
this.scoreElement=document.getElementById('score');
this.streakElement=document.getElementById('streak');
this.resetBtn=document.getElementById('resetBtn');
this.hintBtn=document.getElementById('hintBtn');
this.pauseBtn=document.getElementById('pauseBtn');
this.hintsLeftElement=document.getElementById('hintsLeft');
this.winModal=document.getElementById('winModal');
this.pauseModal=document.getElementById('pauseModal');
this.playAgainBtn=document.getElementById('playAgainBtn');
this.resumeBtn=document.getElementById('resumeBtn');
this.finalTimeElement=document.getElementById('finalTime');
this.finalMovesElement=document.getElementById('finalMoves');
this.finalScoreElement=document.getElementById('finalScore');
this.performanceRating=document.getElementById('performanceRating');
this.ratingStars=document.getElementById('ratingStars');
this.ratingText=document.getElementById('ratingText');
this.leaderboardList=document.getElementById('leaderboardList');
this.difficultyBtns=document.querySelectorAll('.difficulty-btn');
}
init(){
this.createCards();
this.setupEventListeners();
this.updateLeaderboard();
}
setupEventListeners(){
this.resetBtn.addEventListener('click',()=>this.resetGame());
this.hintBtn.addEventListener('click',()=>this.useHint());
this.pauseBtn.addEventListener('click',()=>this.togglePause());
this.playAgainBtn.addEventListener('click',()=>this.playAgain());
this.resumeBtn.addEventListener('click',()=>this.togglePause());
this.difficultyBtns.forEach(btn=>{
btn.addEventListener('click',()=>this.changeDifficulty(btn.dataset.level));
});
[this.winModal,this.pauseModal].forEach(modal=>{
modal.addEventListener('click',(e)=>{
if(e.target===modal){
if(modal===this.winModal)this.playAgain();
if(modal===this.pauseModal)this.togglePause();
}
});
});
document.addEventListener('keydown',(e)=>{
if(e.code==='Space'){
e.preventDefault();
this.togglePause();
}
if(e.code==='KeyH'&&this.hintsLeft>0){
this.useHint();
}
if(e.code==='KeyR'){
this.resetGame();
}
});
}
changeDifficulty(level){
if(level===this.currentDifficulty)return;
this.currentDifficulty=level;
this.difficultyBtns.forEach(btn=>{
btn.classList.toggle('active',btn.dataset.level===level);
});
this.resetGame();
}
createCards(){
const config=this.difficulties[this.currentDifficulty];
this.gameBoard.className=`game-board difficulty-${this.currentDifficulty}`;
this.gameBoard.style.gridTemplateColumns=`repeat(${config.cols}, 1fr)`;
this.gameBoard.innerHTML='';
this.cards=[];
this.flippedCards=[];
this.matchedPairs=0;
this.moves=0;
this.score=0;
this.streak=0;
this.hintsLeft=3;
this.multiplier=config.scoreMultiplier;
this.updateStats();
const emojiSetKeys=Object.keys(this.emojiSets);
const randomSet=emojiSetKeys[Math.floor(Math.random()*emojiSetKeys.length)];
const availableEmojis=[...this.emojiSets[randomSet]];
const selectedEmojis=[];
for(let i=0;i<config.pairs;i++){
const randomIndex=Math.floor(Math.random()*availableEmojis.length);
selectedEmojis.push(availableEmojis.splice(randomIndex,1)[0]);
}
const emojiPairs=[...selectedEmojis,...selectedEmojis];
const shuffledEmojis=this.shuffleArray(emojiPairs);
shuffledEmojis.forEach((emoji,index)=>{
const card=this.createCard(emoji,index);
this.cards.push(card);
this.gameBoard.appendChild(card.element);
});
}
createCard(emoji,id){
const cardElement=document.createElement('div');
cardElement.className='memory-card';
cardElement.dataset.id=id;
cardElement.dataset.emoji=emoji;
cardElement.innerHTML=`
<div class="card-face card-front">${emoji}</div>
<div class="card-face card-back">
<div class="card-pattern"></div>
</div>
`;
cardElement.addEventListener('click',()=>this.flipCard(cardElement));
return{
element:cardElement,
emoji:emoji,
id:id,
isFlipped:false,
isMatched:false
};
}
shuffleArray(array){
const newArray=[...array];
for(let i=newArray.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[newArray[i],newArray[j]]=[newArray[j],newArray[i]];
}
return newArray;
}
flipCard(cardElement){
if(this.isPaused)return;
const cardId=parseInt(cardElement.dataset.id);
const card=this.cards[cardId];
if(card.isFlipped||card.isMatched||this.flippedCards.length>=2){
return;
}
if(!this.isGameActive){
this.startGame();
}
card.isFlipped=true;
cardElement.classList.add('flipped');
this.flippedCards.push(card);
cardElement.style.animation='flipCard 0.6s ease-in-out';
setTimeout(()=>{
cardElement.style.animation='';
},600);
if(this.flippedCards.length===2){
this.moves++;
this.updateStats();
setTimeout(()=>{
this.checkForMatch();
},1000);
}
}
checkForMatch(){
const[card1,card2]=this.flippedCards;
if(card1.emoji===card2.emoji){
this.handleMatch(card1,card2);
}else{
this.handleMismatch(card1,card2);
}
this.flippedCards=[];
const totalPairs=this.difficulties[this.currentDifficulty].pairs;
if(this.matchedPairs===totalPairs){
setTimeout(()=>{
this.endGame();
},500);
}
}
handleMatch(card1,card2){
card1.isMatched=true;
card2.isMatched=true;
card1.element.classList.add('matched');
card2.element.classList.add('matched');
this.matchedPairs++;
this.streak++;
this.maxStreak=Math.max(this.maxStreak,this.streak);
const baseScore=100*this.multiplier;
const streakBonus=this.streak*10;
const timeBonus=Math.max(0,this.difficulties[this.currentDifficulty].timeBonus-Math.floor(this.getElapsedTime()/1000));
this.score+=Math.floor(baseScore+streakBonus+timeBonus);
this.updateStats();
[card1,card2].forEach((card,index)=>{
setTimeout(()=>{
card.element.style.animation='matchSuccess 0.8s ease-out';
setTimeout(()=>{
card.element.style.animation='';
},800);
},index*100);
});
this.showScorePopup(card1.element,baseScore+streakBonus+timeBonus);
}
handleMismatch(card1,card2){
this.streak=0;
this.updateStats();
[card1,card2].forEach(card=>{
card.element.classList.add('shake');
});
setTimeout(()=>{
card1.isFlipped=false;
card2.isFlipped=false;
card1.element.classList.remove('flipped','shake');
card2.element.classList.remove('flipped','shake');
},500);
}
showScorePopup(element,points){
const popup=document.createElement('div');
popup.className='score-popup';
popup.textContent=`+${points}`;
const rect=element.getBoundingClientRect();
popup.style.left=rect.left+rect.width/2+'px';
popup.style.top=rect.top+'px';
document.body.appendChild(popup);
setTimeout(()=>{
popup.remove();
},1000);
}
useHint(){
if(this.hintsLeft<=0||this.isPaused||!this.isGameActive)return;
this.hintsLeft--;
this.hintsLeftElement.textContent=this.hintsLeft;
const unmatchedCards=this.cards.filter(card=>!card.isMatched&&!card.isFlipped);
if(unmatchedCards.length>=2){
for(let i=0;i<unmatchedCards.length;i++){
for(let j=i+1;j<unmatchedCards.length;j++){
if(unmatchedCards[i].emoji===unmatchedCards[j].emoji){
[unmatchedCards[i],unmatchedCards[j]].forEach(card=>{
card.element.classList.add('hint-highlight');
setTimeout(()=>{
card.element.classList.remove('hint-highlight');
},2000);
});
return;
}
}
}
}
}
togglePause(){
if(!this.isGameActive)return;
this.isPaused=!this.isPaused;
if(this.isPaused){
clearInterval(this.timerInterval);
this.pauseModal.classList.add('show');
this.pauseBtn.innerHTML='<span class="btn-icon">▶️</span>Resume';
}else{
this.startTimer();
this.pauseModal.classList.remove('show');
this.pauseBtn.innerHTML='<span class="btn-icon">⏸️</span>Pause';
}
}
startGame(){
this.isGameActive=true;
this.startTime=Date.now();
this.startTimer();
}
startTimer(){
this.timerInterval=setInterval(()=>{
this.updateTimer();
},1000);
}
updateTimer(){
if(!this.startTime||this.isPaused)return;
const elapsed=Math.floor((Date.now()-this.startTime)/1000);
const minutes=Math.floor(elapsed/60);
const seconds=elapsed%60;
this.timerElement.textContent=
`${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}
getElapsedTime(){
return this.startTime?Date.now()-this.startTime:0;
}
updateStats(){
this.movesElement.textContent=this.moves;
this.scoreElement.textContent=this.score.toLocaleString();
this.streakElement.textContent=this.streak;
this.hintsLeftElement.textContent=this.hintsLeft;
}
calculatePerformance(){
const config=this.difficulties[this.currentDifficulty];
const timeInSeconds=Math.floor(this.getElapsedTime()/1000);
const perfectMoves=config.pairs;
const timeScore=Math.max(0,300-timeInSeconds);
const moveScore=Math.max(0,100-(this.moves-perfectMoves)*5);
const streakScore=this.maxStreak*10;
const totalScore=timeScore+moveScore+streakScore;
if(totalScore>=250)return{stars:5,text:'Perfect!'};
if(totalScore>=200)return{stars:4,text:'Excellent!'};
if(totalScore>=150)return{stars:3,text:'Great!'};
if(totalScore>=100)return{stars:2,text:'Good!'};
return{stars:1,text:'Keep practicing!'};
}
endGame(){
this.isGameActive=false;
clearInterval(this.timerInterval);
const finalTime=this.timerElement.textContent;
this.finalTimeElement.textContent=finalTime;
this.finalMovesElement.textContent=this.moves;
this.finalScoreElement.textContent=this.score.toLocaleString();
const performance=this.calculatePerformance();
this.ratingStars.innerHTML='⭐'.repeat(performance.stars)+'☆'.repeat(5-performance.stars);
this.ratingText.textContent=performance.text;
this.saveScore();
this.updateLeaderboard();
this.winModal.classList.add('show');
this.cards.forEach((card,index)=>{
setTimeout(()=>{
card.element.style.animation='celebrate 1s ease-out';
},index*50);
});
}
saveScore(){
const scores=this.getLeaderboard();
const newScore={
score:this.score,
time:this.timerElement.textContent,
moves:this.moves,
difficulty:this.currentDifficulty,
date:new Date().toLocaleDateString()
};
scores.push(newScore);
scores.sort((a,b)=>b.score-a.score);
scores.splice(5);
localStorage.setItem('memoryGameLeaderboard',JSON.stringify(scores));
}
getLeaderboard(){
const saved=localStorage.getItem('memoryGameLeaderboard');
return saved?JSON.parse(saved):[];
}
loadLeaderboard(){
const scores=this.getLeaderboard();
if(scores.length===0){
const sampleScores=[
{score:2500,time:'02:30',moves:16,difficulty:'easy',date:new Date().toLocaleDateString()},
{score:1800,time:'03:45',moves:24,difficulty:'medium',date:new Date().toLocaleDateString()},
{score:1200,time:'05:20',moves:32,difficulty:'hard',date:new Date().toLocaleDateString()}
];
localStorage.setItem('memoryGameLeaderboard',JSON.stringify(sampleScores));
}
}
updateLeaderboard(){
const scores=this.getLeaderboard();
this.leaderboardList.innerHTML='';
scores.forEach((score,index)=>{
const item=document.createElement('div');
item.className='leaderboard-item';
item.innerHTML=`
<div class="rank">#${index+1}</div>
<div class="score-info">
<div class="score-value">${score.score.toLocaleString()}</div>
<div class="score-details">${score.time} • ${score.moves} moves • ${score.difficulty}</div>
</div>
`;
this.leaderboardList.appendChild(item);
});
}
resetGame(){
this.isGameActive=false;
this.isPaused=false;
clearInterval(this.timerInterval);
this.timerElement.textContent='00:00';
this.startTime=null;
this.pauseBtn.innerHTML='<span class="btn-icon">⏸️</span>Pause';
this.createCards();
}
playAgain(){
this.winModal.classList.remove('show');
this.resetGame();
}
}
document.addEventListener('DOMContentLoaded',()=>{
new MemoryGame();
});
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

//global variables
const cellsize = 100;
const cellgap = 3;
let numberofresources = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
const winningscore = 50;
let chosendefender = 1;

const gamegrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];

//mouse
const mouse = {
  x: 10,
  y: 10,
  height: 0.1,
  width: 0.1,
  clicked: false
};
canvas.addEventListener('mousedown', function(){
    mouse.clicked = true;
});
canvas.addEventListener('mouseup', function(){
    mouse.clicked = false;
});
let canvasposition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasposition.left;
    mouse.y = e.y - canvasposition.top;
});
canvas.addEventListener('mouseleave',function(){
   mouse.x = undefined;
   mouse.y = undefined;
});

// game board
const controlsbar = {
  width: canvas.width,
    height: cellsize,
};
class cell{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellsize;
        this.height = cellsize;
    }
    draw(){
        if (mouse.x && mouse.y && collision(this, mouse)){
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y, this.width, this.height); 
        }
    }
}
function creategrid(){
    for(let y = cellsize; y < canvas.height; y += cellsize){
        for(let x = 0; x < canvas.width; x += cellsize){
            gamegrid.push(new cell(x, y));
        }
    }
}
creategrid();
function handlegamegrid(){
    for (let i = 0; i < gamegrid.length; i++){
        gamegrid[i].draw();
    }
}
//projectiles
class Projectile{
    constructor(x,y){
     this.x = x;
     this.y = y;
     this.width = 10;
     this.height = 10;
     this.power = 20;   
     this.speed = 5;    
    }
   update(){
       this.x += this.speed;
   }
  draw(){
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
      ctx.fill();
  }    
}
function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();
        
        for(let j = 0; j < enemies.length; j++){
            if(enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }
        
        if(projectiles[i] && projectiles[i].x > canvas.width - cellsize){
            projectiles.splice(i, 1);
            i--;
        }
    }
}

//defenders
const defender1 = new Image();
defender1.src = 'img/Turret.png';
const defender2 = new Image();
defender2.src = 'img/bomb tower.png';
class Defender{
    constructor(x, y){
       this.x = x; 
       this.y = y;
       this.width = cellsize - cellgap * 2;
       this.height = cellsize - cellgap * 2;
       this.shooting = false;
        this.shootnow = false;
       this.health = 100;
       this.projectiles = []; 
       this.frameX = 0;
       this.frameY = 0;
       this.spritewidth = 105;
       this.spriteheight = 91;
       this.minFrame = 0;
       this.maxframe = 4;
      this.chosendefender = chosendefender;    
    }
    
    draw(){
        //ctx.fillStyle = 'blue';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 15);      
        if(this.chosendefender === 1){
            ctx.drawImage(defender1, this.frameX * this.spritewidth, 0, this.spritewidth, this.spriteheight, this.x, this.y, this.width, this.height);
             this.spritewidth = 105;
             this.spriteheight = 91;
        }else if(this.chosendefender === 2){
             ctx.drawImage(defender2, this.frameX * this.spritewidth, 0, this.spritewidth, this.spriteheight, this.x, this.y, this.width, this.height);
             this.spritewidth = 84;
       this.spriteheight = 63;
        }
    
    }
    update(){
        if(frame % 12 === 0){
                   if(this.frameX < this.maxframe) this.frameX++;
        else this.frameX = this.minFrame; 
        if(this.frameX === 3) this.shootnow = true;
        }
        if(this.shooting && this.shootnow){
        projectiles.push(new Projectile(this.x + 70, this.y + 25));
        this.shootnow = false;
    }
    if(this.chosendefender === 1){
          if(this.shooting){
       this.minFrame = 0;
       this.maxframe = 3;
   }else {
       this.minFrame = 1;
       this.maxframe = 1;
        }
    }else if(this.chosendefender === 2){
          if(this.shooting){
       this.minFrame = 0;
       this.maxframe = 4;
   }else {
       this.minFrame = 1;
       this.maxframe = 1;
        }
    }
 
   }
}



function handleDefenders(){
    for (let i = 0; i < defenders.length; i++){
        defenders[i].draw();
        defenders[i].update();
        if(enemyPositions.indexOf(defenders[i].y)!== -1){
            defenders[i].shooting = true;
        }else{
            defenders[i].shooting = false;
        }
        for(let j = 0; j < enemies.length; j++){
            if (defenders[i] && collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
               defenders[i].health -= 1;
            }
            if (defenders[i] && defenders[i].health <= 0){
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

const card1 = {
    x: 10,
    y: 10,
    width: 70,
    height: 85
};
const card2 = {
    x: 90,
    y: 10,
    width: 70,
    height: 85
};

function choosedefender(){
    let card1stroke = 'black';
    let card2stroke = 'black';
    if(collision(mouse, card1) && mouse.clicked){
        chosendefender = 1;
    }else if (collision(mouse, card2) && mouse.clicked){
        chosendefender = 2;
    }
    if(chosendefender === 1){
        card1stroke = 'gold';
        card2stroke = 'black';
    }else if(chosendefender === 2){
        card1stroke = 'black';
        card2stroke = 'gold';
    }else{
        card1stroke = 'black';
        card2stroke = 'black';
    }
    
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
    ctx.drawImage(defender1, 0, 0, 105, 105, 0, 10, 194/2, 194/2);   
    ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
    ctx.drawImage(defender2, 0, 0, 84, 84, 85, 20, 194/2, 194/2);
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
}

//floating Messages
const floatingMessages = [];
class floatingMessage {
    constructor(value, x, y, size, color){
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifespan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update(){
        this.y -= 0.3;
        this.lifespan += 1;
        if(this.opacity > 0.01) this.opacity -= 0.03;
    }
    draw(){
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px Arial';
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
function handlefloatingmessages(){
    for(let i = 0; i < floatingMessages.length; i++){
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if(floatingMessages[i].lifespan >= 50){
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}

//enemies
const enemytypes = [];
const enemy1 = new Image();
enemy1.src = 'img/Fly.png';
enemytypes.push(enemy1);
const enemy2 = new Image();
enemy2.src ='img/bee.png';
enemytypes.push(enemy2);
class Enemy{
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellsize - cellgap * 2;
        this.height = cellsize - cellgap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxhealth = this.health;
        this.enemyType = enemytypes[Math.floor(Math.random() * enemytypes.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        if(this.enemyType === enemy1){
            this.maxframe = 1;
             this.spritewidth = 84;
            this.spriteheight = 77;
        }else if(this.enemyType === enemy2){
           this.maxframe = 2; 
            this.spriteheight = 84;
            this.spritewidth = 98;
            this.health = 125;

        } 
    
    }
    update(){
        this.x -= this.movement;
        if(frame % 10 === 0){
           if (this.frameX < this.maxframe) this.frameX ++;
        else this.frameX = this.minFrame;   
        }
      
    }
    draw(){
        //ctx.fillStyle = 'red';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        ctx.drawImage(this.enemyType, this.frameX * this.spritewidth, 0, this.spritewidth, this.spriteheight, this.x, this.y, this.width, this.height);
    }     
}
function handleEnemies(){
    for (let i = 0; i < enemies.length; i ++){
        enemies[i].update();
        enemies[i].draw();
        if(enemies[i].x < 0){
            gameOver = true;
        }
        if(enemies[i].health <= 0){
            let gainedresources = enemies[i].maxhealth/10;
            floatingMessages.push(new floatingMessage('+' + gainedresources, enemies[i].x, enemies[i].y, 30, 'black'));
            floatingMessages.push(new floatingMessage('+' + gainedresources, 470, 85, 30, 'gold'));
            numberofresources += gainedresources;
            score += gainedresources;
            const findthisindex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findthisindex, 1);
            enemies.splice(i, 1);
            i--;
        }
    }
    if (frame % enemiesInterval === 0 && score < winningscore){
        let verticalPosition = Math.floor(Math.random()* 5 + 1) * cellsize + cellgap;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if(enemiesInterval > 120) enemiesInterval -= 50;
    }
}
//resources
const amounts = [20, 30, 40];
class resource{
    constructor(){
        this.x = Math.random() * (canvas.width - cellsize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellsize + 25;
        this.width = cellsize * 0.6;
        this.height = cellsize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw(){
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(this.amount, this.x + 15, this.y + 25);
    }
}
function handleResources(){
    if(frame % 500 === 0 && score < winningscore){
        resources.push(new resource());
    }
    for(let i = 0; i < resources.length; i++){
        resources[i].draw();
        if(resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)){
            numberofresources += resources[i].amount;
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 30, 'black'));
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, 470, 85, 30, 'gold'));
            resources.splice(i, 1);
            i--;
        }
    }
}

//utillities
function handlegameststatus(){
    ctx.fillStyle = 'gold';
    ctx.font = '30px Arial';
    ctx.fillText('Resources:' + numberofresources, 180, 80);
    ctx.fillText('score:' + score, 180, 40);
    if(gameOver){
        ctx.fillStyle = 'black';
        ctx.font = '90px Arial';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if(score >= winningscore && enemies.length === 0){
        ctx.fillStyle = 'black';
        ctx.font = '60px Arial';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Arial';
        ctx.fillText('You win with' + score + 'points!', 134, 340);
    }
}


canvas.addEventListener('click', function(){
   const gridpositionX = mouse.x - (mouse.x % cellsize) + cellgap;
   const gridpositionY = mouse.y - (mouse.y % cellsize) + cellgap;
    if (gridpositionY < cellsize) return;
    for (let i = 0; i < defenders.length; i++){
        if (defenders[i].x === gridpositionX && defenders[i].y === gridpositionY) 
            return;
    }
    let defendercost = 100;
    if (numberofresources >= defendercost){
        defenders.push(new Defender(gridpositionX, gridpositionY));
        numberofresources -= defendercost;
    }   else{
        floatingMessages.push(new floatingMessage('need more resources', mouse.x, mouse.y, 20, 'blue'));
    }
});

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0,0,controlsbar.width, controlsbar.height);
    handlegamegrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    choosedefender();
    handlegameststatus();
    handlefloatingmessages();
    frame++;
  if(!gameOver)  requestAnimationFrame(animate);
}
animate();

function collision(first, second){
 if (    !(first.x > second.x + second.width ||
           first.x + first.width < second.x ||
           first.y > second.y + second.height ||
           first.y + first.height < second.y)
    ){
        return true;
    }
}

window.addEventListener('resize', function(){
    canvasposition = canvas.getBoundingClientRect();
});
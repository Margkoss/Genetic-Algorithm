let population;
let lifespan = 300;
let count = 0;
let lifeP;
let target;
let magnitude = 0.3;

let rx = 300;
let ry = 400;
let rw = 200;
let rh = 10;

//p5.js standard setup function
function setup(){
    createCanvas(800,600);

    target = createVector(width/2, 50);

    lifeP = createP();
    population = new Population(50);
}

//p5.js standard refresh function
function draw(){
    background(0);
    population.run();
    lifeP.html(count);
    count++;

    if(count == lifespan){
        population.evaluate();
        population.selection();
        count = 0;
    }

    fill(255)
    rect(rx, ry, rw, rh);
    ellipse(target.x, target.y, 20, 20);
}

/**
 * Rocket constructor function
 */
function Rocket(dna){
    this.pos = createVector(width/2, height);
    this.vel = createVector();
    this.acc = createVector();
    this.completed = false;
    this.crashed = false;
    this.fitness = 0;
    if(dna) {
        this.dna = dna;
    }
    else{
        this.dna = new DNA();
    }

    this.calcFitness = () => {
        let d = dist(this.pos.x, this.pos.y, target.x, target.y);
        
        this.fitness = map(d, 0, width, width, 0);
        if(this.completed){
            this.fitness *= 10;
        }

        if(this.crashed){
            this.fitness /= 10;
        }
    }    

    this.applyForce = (force) => {
        this.acc.add(force);
    }

    this.update = () => {
        let d = dist(this.pos.x, this.pos.y, target.x, target.y);
        if(d < 10){
            this.completed = true;
            this.pos = target.copy();
        }
        
        if(this.pos.x > rx && this.pos.x < rx+rw && this.pos.y > ry && this.pos.y < ry+rh){
            this.crashed = true;
        }

        if(this.pos.x > width || this.pos.x < 0){
            this.crashed = true;
        }

        if(this.pos.y > height || this.pos.y < 0){
            this.crashed = true;
        }

        this.applyForce(this.dna.genes[count]);

        if(!this.completed && !this.crashed){
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.mult(0);
            this.vel.limit(4)
        }
    }

    this.show = () => {
        push();
        fill(255,150);
        translate(this.pos.x, this.pos.y)
        rotate(this.vel.heading());
        rectMode(CENTER);
        rect(0 , 0, 25, 5);
        pop();
    }
}


/**
 * Population constructor function
 */
function Population(population) {
    this.rockets = [];
    this.populationSize = population;
    this.matingPool = [];

    for(let i = 0; i < this.populationSize; i++){
        this.rockets[i] = new Rocket();
    }

    this.evaluate = () => {

        let maxfit = 0;
        for(let i = 0; i < this.populationSize; i++){
            this.rockets[i].calcFitness();
            if(this.rockets[i].fitness > maxfit)
                maxfit = this.rockets[i].fitness;
        }

        for(let i = 0; i < this.populationSize; i++){
            this.rockets[i].fitness /= maxfit;
        }

        this.matingPool = [];

        for(let i = 0; i < this.populationSize; i++){
            let n = this.rockets[i].fitness * 100;
            for(let j = 0; j < n; j++){
                this.matingPool.push(this.rockets[i]);
            }
        }

    }

    this.selection = () => {
        let newRockets = [];

        
        for(let i = 0; i < this.rockets.length; i++){
            let parent1 = random(this.matingPool).dna;
            let parent2 = random(this.matingPool).dna;
            let child = parent1.crossover(parent2);
            child.mutation();

            newRockets[i] = new Rocket(child);
        }
        
        this.rockets = newRockets;
    }

    this.run = () => {
        for(let i = 0; i < this.populationSize; i++){
            this.rockets[i].update();
            this.rockets[i].show();
        }
    }
}

/**
 * Individual rockets DNA
 */
function DNA(genes){
    if(genes) {
        this.genes = genes;
    }
    else
    {
        this.genes = [];

        for(let i = 0;  i < lifespan; i++){
            this.genes[i] = p5.Vector.random2D();
            this.genes[i].setMag(magnitude);
        }
        
    }

    this.crossover = (partner) => {
        let newDNA = [];

        let mid = floor(random(this.genes.length));
        for(let i = 0; i < this.genes.length; i++){
            if(i > mid)
                newDNA[i] = this.genes[i]
            else
                newDNA[i] = partner.genes[i]
        }

        return new DNA(newDNA);
    }

    this.mutation = () => {
        for(let i = 0; i < this.genes.length; i++){
            if(random(1) < 0.01){
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].setMag(magnitude);
            }
        }
    }
}
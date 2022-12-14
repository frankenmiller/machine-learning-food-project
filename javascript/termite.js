var mut_rate = 0.01;

class Termite {
  constructor(x, y, dna) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, -2);
    this.position = createVector(x, y);
    this.r = 4;
    this.maxspeed = 2.5;
    this.maxforce = .18;
    this.health = 1;
    this.dna = [];
    if (dna == undefined) {
      // food weight
      this.dna[0] = random(-2, 2);
      // poison weight
      this.dna[1] = random(-2, 2);
      // food perception
      this.dna[2] = random(10, 70);
      // poison perception
      this.dna[3] = random(10, 70);
    } else {
      this.dna[0] = dna[0]; // attract/repel to food
      if (random(1) < mut_rate) {
        this.dna[0] += random(-0.2, 0.2);
      }
      this.dna[1] = dna[1]; // attract/repel to poison
      if (random(1) < mut_rate) {
        this.dna[1] += random(-0.2, 0.2);
      }
      this.dna[2] = dna[2]; // perception to food
      if (random(1) < mut_rate) {
        this.dna[2] += random(-10, 10);
      }
      this.dna[3] = dna[3]; // perception to poison
      if (random(1) < mut_rate) {
        this.dna[3] += random(-10, 10);
      }
    }
  }

  // Method to update location
  update() {
    this.health -= 0.0025 // this causes the termite to grow old
    this.velocity.add(this.acceleration); // Update velocity
    this.velocity.limit(this.maxspeed); // Limit speed
    this.position.add(this.velocity); 
    this.acceleration.mult(0); // Reset accelertion to 0 each cycle
  }

  applyForce(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  }

  behaviors = function(good, bad) {
    var steerG = this.eat(good, 0.2, this.dna[2]);
    var steerB = this.eat(bad, -0.5, this.dna[3]);

    steerG.mult(this.dna[0]);
    steerB.mult(this.dna[1]);
    this.applyForce(steerG);
    this.applyForce(steerB);
  }

  clone = function() { // <!---------------------------------- clone method -->
    if (random(1) < 0.0009) {
      return new Termite(this.position.x, this.position.y, this.dna);
    } else {
      return null;
    }
  }

  eat = function(list, nutrition, perception) { // <!---------- eat method -->
    var record = Infinity;
    var closest = null;
    for (var i=list.length-1; i>=0; i--) {
      var d = dist(this.position.x, this.position.y, list[i].x, list[i].y);
      if (d < (5 * this.maxspeed)) {
        list.splice(i, 1);
        this.health += nutrition;
      } else {
        if (d < record && d < perception) {
          record = d;
          closest = list[i];
        }
      }
    }
    if (closest != null) {
      // if another bug arises you can change this line to (closest > -1)
      return this.seek(closest);
    }
    return createVector(0, 0);
  }

  // A method that calculates a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) { // <!--------------------------------------- seek method -->
    var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    // Scale to maximum speed
    desired.setMag(this.maxspeed);
    // Steering = Desired minus velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
  }

  dead = function() {
    return (this.health <= 0);
  }

  boundaries = function() {
    var d = 25;
    let desired = null;
  
    if (this.position.x < d) {
      desired = createVector(this.maxspeed, this.velocity.y);
    } else if (this.position.x > width - d) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }
  
    if (this.position.y < d) {
      desired = createVector(this.velocity.x, this.maxspeed);
    } else if (this.position.y > height - d) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }
  
    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxspeed);
      let steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
  }

  display() { // <!---------------------------------------- display method -->
    // Draw a triangle rotated in the direction of velocity
    let angle = this.velocity.heading() + PI / 2;
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    var food_color = color(0, 255, 0); // green means finds food tasty
    if (this.dna[0] < 0) {
      food_color = color(255, 255, 0); // yellow means no attraction to food
    }
    var poison_color = color(255, 127, 0); // orange means finds shit tasty
    if (this.dna[1] < 0) {
      poison_color = color(255, 0, 0); // red means repelled from poison
    }
    stroke(poison_color);
    noFill();
    // attraction to poison
    rect(6.5, -7.5, 1, -abs(this.dna[0] * 20));
    // perception to poison
    ellipse(0, 0, this.dna[2] * 2);
    stroke(food_color);
    // attraction to food
    rect(-6.5, -7.5, 1, -abs(this.dna[1] * 20));
    // perception to food
    ellipse(0, 0, this.dna[3] * 2);

    var BLACK = color(0, 0, 0);
    var WHITE = color(255, 255, 255);
    var COLOR = lerpColor(BLACK, WHITE, this.health);
    var BORDER = lerpColor(WHITE, BLACK, this.health);

    fill(COLOR);
    strokeWeight(2);
    stroke(BORDER);
    ellipse(0, 0, 2 * this.r)
    ellipse(0, -2 * (this.r), 2 * this.r)
    ellipse(0, 2 * (this.r), 2 * this.r)
    // beginShape();
    // vertex(0, -this.r * 2);
    // vertex(-this.r, this.r * 2);
    // vertex(this.r, this.r * 2);
    // endShape(CLOSE);
    pop();
  }
}


  // spawn = function() { // <!------------------------------ spawn method -->
  //   if (random(1) < 0.005) {
  //     var x = random(25, width -25);
  //     var y = random(25, height -25);      
  //     return new Termite(x, y);
  //   } else {
  //     return null;
  //   }
  // }
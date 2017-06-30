/* adapted from :
// M_6_1_01.pde
// Node.pde
//
// Generative Gestaltung, ISBN: 978-3-87439-759-9
// First Edition, Hermann Schmidt, Mainz, 2009
// Hartmut Bohnacker, Benedikt Gross, Julia Laub, Claudius Lazzeroni
// Copyright 2009 Hartmut Bohnacker, Benedikt Gross, Julia Laub, Claudius Lazzeroni
//
// http://www.generative-gestaltung.de
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
*/
function Node(x, y, h, diam, data) {
    this.diameter = diam || 25;
    this.minX = 0;
    this.maxX = windowWidth;
    this.minY = 0;
    this.maxY = windowHeight;
    this.minZ = -60000;
    this.maxZ = 60000;
    this.location = createVector(x, y, 0);
    this.velocity = createVector(0, 0, 0);
    this.pVelocity = createVector(0, 0, 0);
    this.maxVelocity = 9;
    this.damping = 0.05;
    // radius of impact
    this.radius = diam * 1.4;
    // strength: positive for attraction, negative for repulsion (default for Nodes)
    this.strength = 1;
    // parameter that influences the form of the function
    this.ramp = 0.50;
    this.h = h || 0;
    this.data = data || null;
    this.displayData = false;

    this.life = 100;
}
Node.prototype.attract = function (theNode) {
    var d = dist(this.location.x, this.location.y, theNode.location.x, theNode.location.y);
    if (d > 0 && d < this.radius) {
        var s = pow(d / this.radius, 1 / this.ramp);
        var f = s * 9 * this.strength * (1 / (s + 1) + ((s - 3) / 4)) / d;
        var df = p5.Vector.sub(this.location, theNode.location);
        df.mult(f);
        this.velocity.x += df.x;
        this.velocity.y += df.y;
        this.velocity.z += df.z;
    }
}
Node.prototype.update = function () {
    this.velocity.limit(this.maxVelocity);
    this.pVelocity.set(this.velocity);
    this.location.x += this.velocity.x;
    this.location.y += this.velocity.y;
    this.location.z += this.velocity.z;
    if (this.location.x < this.minX +this.diameter) {

        //this.location.x = this.minX - (this.location.x - this.minX);
        this.velocity.x = -this.velocity.x;
    }
    if (this.location.x > this.maxX - this.diameter) {
        //this.location.x = this.maxX - (this.location.x - this.maxX);
        this.velocity.x = -this.velocity.x;
    }
    if (this.location.y < this.minY +this.diameter) {
    this.location.y = this.minY +this.diameter;
        this.velocity.y = -this.velocity.y;
    }
    if (this.location.y > this.maxY-this.diameter) {
        this.location.y = this.maxY - this.diameter
        this.velocity.y = -this.velocity.y;
    }
    this.velocity.mult(1 - this.damping);
}
Node.prototype.display = function () {
    push();
    noStroke();
    fill(this.h,100,100,this.life);
    ellipse(this.location.x, this.location.y, this.diameter, this.diameter);
    pop();
}
Node.prototype.over = function (x, y) {

    var delta = dist(x, y, this.location.x, this.location.y);

        if (delta < this.diameter/2) {
            push()
            fill(0)
            textFont(fontRegular)
            textSize(14)
            text(this.data.lieu + " - " + this.data.date  ,this.location.x,this.location.y-16)
            text(this.data.emplacement,this.location.x,this.location.y)
            text(this.data.valeur,this.location.x,this.location.y+16)
            pop()

        }
        else {

        }

}

import { Component, OnInit } from '@angular/core';
import * as p5 from 'p5';
import { Particle, Group } from './particle';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    private particles: Particle[] = [];
    private p5: p5;

    // Settings
    public population = 100;
    public groups: Group[] = [
        new Group('red', 1, 100),
        new Group('blue', 1, 100)
    ];

    ngOnInit() {
        this.p5 = new p5(this.drawing);
    }

    public start() {
        this.populate();
        this.p5.loop();
    }

    public stop() {
        this.p5.noLoop();
    }

    public reset() {
        //
    }

    private drawing(s: any) {
        s.setup = () => {
            s.createCanvas(500, 500).parent('canvas-wrapper');
            s.frameRate(40);
        };

        const particles = this.particles;
        s.draw = () => {
            s.clear();
            s.noStroke();
            particles.forEach(particle => {
                particle.collideWith(this.particles);
                particle.move();
                particle.display();
            });

            // Calculate stats
            // app.stats.left.value = particles.filter(p => p.position.x < width / 2).length;
            // app.stats.right.value = particles.filter(p => p.position.x > width / 2).length;
            // app.stats.left.el.innerHTML = app.stats.left.value;
            // app.stats.right.el.innerHTML = app.stats.right.value;
            // recordGroupStats();

            // Draw gridlines on top
            s.stroke(155);
            s.line(s.width / 2, 0, s.width / 2, s.height);

        };
    }

    private populate() {
        this.particles = [];

        // Calculate the population of each group based on the set ratio of each.
        let ratioWhole = this.groups.reduce((acc, g) => acc + g.ratio, 0);
        this.groups.forEach(g => g.population = this.p5.floor(this.population * g.ratio / ratioWhole));
        while (this.groups.reduce((acc, g) => acc + g.population, 0) < this.population) {
            // If even distribution of the total population is not possible,
            // randomly assign an extra particle to a group until we reach
            // the total population.
            const randomIndex = this.p5.floor(this.p5.random(0, this.groups.length));
            this.groups[randomIndex].population++;
        }

        // Now create the particles in each group.
        this.groups.forEach(group => {
            for (let i = 0; i < group.population; i++) {
                const particle = new Particle(this.p5, this.groups, group, i.toString());
                this.particles.push(particle);
                particle.placeAmong(this.particles);
            }
        });

    }
}

import * as p5 from 'p5';

export enum Placement {
    Random, Grouped
}

export class Particle {
    private p5: p5;
    private groups: Group[];
    public position: p5.Vector;
    public velocity: p5.Vector;
    public radius: number;
    public color: p5.Color;
    public group: Group;
    public id: string;
    public spring: number;
    public friction: number;
    public placement: Placement;
    public sectors: number;

    constructor(p5: p5, groups: Group[], group: Group, id: string) {
        this.p5 = p5;
        this.groups = groups;
        this.group = group;
        this.id = id;
    }

    get name(): string {
        return this.group.name + this.id;
    }

    public isCollidingWith(p: Particle) {
        let dx = this.position.x - p.position.x;
        let dy = this.position.y - p.position.y;
        let distance = this.p5.sqrt(dx * dx + dy * dy);
        let minDist = this.radius + p.radius;
        return distance < minDist;
    }

    public placeAmong(particles: Particle[]) {
        // Place all particles in accordance with the placement setting,
        // but make sure none is on top of another.
        this.position = this.getInitialPosition();
        particles.filter(p => p.id !== this.id).forEach(p => {
            if (this.isCollidingWith(p)) {
                this.position = this.getInitialPosition();
            }
        });
    }

    private getInitialPosition() {
        if (this.placement === Placement.Random) {
            return this.p5.createVector(this.p5.random(this.p5.width), this.p5.random(this.p5.height))
        }
        if (this.placement === Placement.Grouped) {
            const sectorWidth = this.p5.width / this.sectors;
            const position = this.p5.createVector(this.p5.random(sectorWidth), this.p5.random(this.p5.height));
            const offsetFactor = this.groups.findIndex(g => g === this.group);
            position.x += offsetFactor * sectorWidth;
            return position;
        }
    }

    public move() {
        this.position.add(this.velocity);
        // Bounce off the top edge
        if (this.position.y < this.radius) {
            this.velocity.y *= this.friction;
            this.position.y = this.radius;
        }
        // Bounce off the bottom edge
        if (this.position.y > (this.p5.height - this.radius)) {
            this.velocity.y *= this.friction;
            this.position.y = this.p5.height - this.radius;
        }
        // Bounce of the right edge
        if (this.position.x > (this.p5.width - this.radius)) {
            this.velocity.x *= this.friction;
            this.position.x = this.p5.width - this.radius;
        }
        // Bounce off the left edge
        if (this.position.x < this.radius) {
            this.velocity.x *= this.friction;
            this.position.x = this.radius;
        }
    }

    public collideWith(particles: Particle[]) {
        particles.filter(p => p.id !== this.id && this.isCollidingWith(p)).forEach(p => {
            let dx = p.position.x - this.position.x;
            let dy = p.position.y - this.position.y;
            let angle = this.p5.atan2(dy, dx);
            let targetX = this.position.x + this.p5.cos(angle) * (this.radius + p.radius);
            let targetY = this.position.y + this.p5.sin(angle) * (this.radius + p.radius);
            let ax = (targetX - p.position.x) * this.spring;
            let ay = (targetY - p.position.y) * this.spring;
            let bounce = this.p5.createVector(ax, ay);
            this.velocity.sub(bounce);
            p.velocity.add(bounce);
        });
    }

    public display() {
        this.p5.fill(this.color);
        const diameter = 2 * this.radius - 1;
        this.p5.ellipse(this.position.x, this.position.y, diameter, diameter);
    }
}

export class Group {
    constructor(
        public name: string,
        public ratio: number,
        public population: number
    ) { }
}

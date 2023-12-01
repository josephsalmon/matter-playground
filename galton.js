import Matter from "matter-js";

import statdists from '@stdlib/dist-stats-base-dists-flat';
const dists = statdists.base.dists;

const arrayRange = (start, stop, step) =>
    Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );
const x = arrayRange(-5, 5, 0.01);
const sigma = 1;
const mu = 0;
// const cdf = x.map(x => dists['normal'].cdf(x, mu, sigma));

export const Example = {};
Example.galton = function () {
    let Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Events = Matter.Events,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;
    // create engine
    let engine = Engine.create({
        enableSleeping: false
    }),
        world = engine.world;
    const width = 500;
    const height = 500;
    // create renderer
    let render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false
        }
    });
    Render.run(render);
    // create runner
    let runner = Runner.create({
        delta: 1000 / (60 * 10), // 600Hz delta = 1.666ms = 10upf @ 60fps (10x default precision)
        maxFrameTime: 1000 / 20 // performance budget
    });
    Runner.run(runner, engine);
    const discretize = (x) => Math.trunc(x / size) * size;

    const size = 2;
    const shootbins = 100;
    let total = 1000;
    const shootheightmax = 20;
    const speed = 10;

    const shootheightmin = shootheightmax + (size + 1) * shootbins;
    const distribution = 'normal';
    engine.gravity.y = 0;
    World.add(
        world,
        Bodies.rectangle(width / 2, height - size/2, width, size, {
            isStatic: true,
            restitution: 0.0,
            friction: 0,
            density: 1000,
            render: {
                fillStyle: "#ffffff",
                visible: true
            },
            id: "floor"
        })
    );
    let xshift = 1;
    let prevpeg;
    for (let i = 0; i < shootbins; i++) {
        const unifm1p1 = (i+1) / (shootbins+1);
        const quantile = dists[distribution].quantile(unifm1p1, mu, sigma);
        let x = discretize((quantile * 40 + width / 2));
        if ((i > 0) && (prevpeg.position.x != x + xshift)) {
            xshift++; 
        }
        const peg = Bodies.rectangle(x + xshift, shootheightmin - i * (size + 1), size, size, {
            isSensor: true,
            isStatic: true,
            render: {
                fillStyle: "#ffffff",
                visible: true
            }
        });
        peg.id = "peg" + i;
        prevpeg = peg;
        World.add(world, peg);
    }

    Events.on(engine, 'collisionStart', function(event) {
        let pairs = event.pairs;
        for (let i = 0, j = pairs.length; i != j; ++i) {
            let pair = pairs[i];
            if (pair.bodyA.id == "floor" || (pair.bodyA.id.startsWith("square") && pair.bodyA.isStatic)) {
                Body.setPosition(pair.bodyB, { x: pair.bodyB.position.x, y: pair.bodyA.position.y - size });
                Body.setStatic(pair.bodyB, true);
            } else if (pair.bodyA.id.startsWith("peg")) {
                Body.setPosition(pair.bodyB, pair.bodyA.position);
                Body.setVelocity(pair.bodyB, { x: 0, y: speed  });
            }
        }
    });
    
    setInterval(() => {
        if (total-- > 0) {
            const unifm1p1 = Math.random();
            const unidisc = Math.trunc(unifm1p1 * shootbins);
            const square = Bodies.rectangle(
                10, shootheightmin - unidisc * (size + 1)
                , size, size, {
                // isSensor: true,
                sleepThreshold: 10,
                friction: 1,
                frictionAir: 0,
                density: 1,
                restitution: 0.0,
                render: {
                    fillStyle: "#ff00ff",
                    visible: true
                }
            });
            square.id = "square" + total;
            Body.setVelocity(square, { x: speed, y: 0 });
            Matter.Events.on(square, "sleepStart", () => {
                Matter.Body.setStatic(square, true);
            });
            World.add(world, square);
        }
    });

    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};

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
    var Engine = Matter.Engine,
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
    var engine = Engine.create({
        enableSleeping: true
    }),
        world = engine.world;
    const width = 500;
    const height = 500;
    // create renderer
    var render = Render.create({
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
    var runner = Runner.create({
        delta: 1000 / (60 * 10), // 600Hz delta = 1.666ms = 10upf @ 60fps (10x default precision)
        maxFrameTime: 1000 / 20 // performance budget
    });
    Runner.run(runner, engine);
    const size = 2;
    const discretize = (x) => Math.trunc(x / size) * size;
    // add bodies
    const shootbins = 100;
    const shootheightmax = 20;
    const shootheightmin = shootheightmax + size * shootbins;
    const shootheight = shootheightmin - shootheightmax;
    const middle = (shootheightmax + shootheightmin) / 2;
    const distribution = 'normal';
    let total = 1000;
    engine.gravity.y = 0;
    var pegs = []
    World.add(
        world,
        Bodies.rectangle(width / 2, height - size/2, width, size, {
            isStatic: true,
            restitution: 0.0,
            friction: 1,
            density: 1000,
            render: {
                fillStyle: "#ffffff",
                visible: true
            },
            id: "floor"
        })
    );
    for (let i = 0; i < shootbins; i++) {
        const unifm1p1 = i / shootbins;
        const quantile = dists[distribution].quantile(unifm1p1, mu, sigma);
        const squarecdf = Bodies.rectangle(discretize((quantile * 40 + width / 2)), shootheightmin - (i * size), size, size, {
            isSensor: true,
            isStatic: true,
            // collisionFilter: {
            //     mask: 0
            // },
            render: {
                fillStyle: "#ffffff",
                visible: true
            }
        });
        squarecdf.id = "peg" + i;
        pegs.push(squarecdf);
        World.add(world, squarecdf);
    }
    // Events.on(engine, 'collisionStart', function (event) {
    //     var pairs = event.pairs;

    //     for (var i = 0, j = pairs.length; i != j; ++i) {
    //         var pair = pairs[i];

    //         if (pair.bodyA === collider) {
    //             pair.bodyB.render.strokeStyle = colorA;
    //         } else if (pair.bodyB === collider) {
    //             pair.bodyA.render.strokeStyle = colorA;
    //         }
    //     }
    // });
    Events.on(engine, 'collisionStart', function(event) {
        var pairs = event.pairs;
        
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];
            // console.log("A : " + pair.bodyA.id, "B : " + pair.bodyB.id);
            if (pair.bodyA.id == "floor" || (pair.bodyA.id.startsWith("square") && pair.bodyA.isStatic)) {
                // console.log("Setting static B :" + pair.bodyB.id)
                Body.setPosition(pair.bodyB, { x: pair.bodyB.position.x, y: pair.bodyA.position.y - size });
                Body.setStatic(pair.bodyB, true);
            } else if (pair.bodyA.id.startsWith("peg")) {
                Body.setPosition(pair.bodyB, pair.bodyA.position);
                Body.setVelocity(pair.bodyB, { x: 0, y: 10  });
            }
        }
    });
    setInterval(() => {
        if (total-- > 0) {
            const unifm1p1 = Math.random();
            const unidisc = Math.trunc(unifm1p1 * shootbins);
            const quantile = dists[distribution].quantile(unifm1p1, mu, sigma);
            const cdf = dists[distribution].cdf(unifm1p1, mu, sigma);
            const square = Bodies.rectangle(
                // discretize((quantile*40+width/2) ), discretize(shootheightmin-(unifm1p1*shootheight)+size)
                10, shootheightmin - size - discretize(unifm1p1 * (shootheight - 2 * size))
                , size, size, {
                sleepThreshold: 10,
                friction: 1,
                density: 1,
                restitution: 0.0,
                slop: 0,
                render: {
                    fillStyle: "#ff00ff",
                    visible: true
                }
            });
            square.id = "square" + total;
            Body.setVelocity(square, { x: 10, y: 0 });
            Matter.Events.on(square, "sleepStart", () => {
                Matter.Body.setStatic(square, true);
            });
            World.add(world, square);


            // World.add(
            //     world,
            //     Bodies.rectangle(discretize((quantile*40+width/2) ), 1*height/3 + (-(unifm1p1-0.5)*height/3)
            //     -10, size,size, {
            //     isStatic: true,
            //     render: {
            //         fillStyle: "#ffffff",
            //         visible: true
            //     }
            // }))
        }
    }, 1);

    // World.add(world, pegs);
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

// const delta = 1000 / 60;
// const subSteps = 50;
// const subDelta = delta / subSteps;
// const {engine, runner, render, canvas, stop} = Example.galton();
// (function run() {
//     window.requestAnimationFrame(run);
//     for (let i = 0; i < subSteps; i += 1) {
//     Matter.Engine.update(engine, subDelta);
//     }
// })();

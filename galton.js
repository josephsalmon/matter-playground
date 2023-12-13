import Matter, { World } from "matter-js";

import statdists from '@stdlib/dist-stats-base-dists-flat';
const dists = statdists.base.dists;
const cdf = dists.normal.cdf;

let mu1 = -3; // mean of the first variable
let sigma1 = 0.6; // standard deviation of the first variable
let mu2 = 3; // mean of the second variable
let sigma2 = 1.3; // standard deviation of the second variable
let p = 0.5; // weight of the first distribution

function bimodalCDF(x) {
    let cdf1 = cdf(x, mu1, sigma1);
    let cdf2 = cdf(x, mu2, sigma2);
    return p * cdf1 + (1-p) * cdf2;
}

const arrayRange = (start, stop, step) =>
    Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );
const x = arrayRange(-5, 5, 0.01);
const sigma = 1;
const mu = 0;


function closest (num, arr) {
    var curr = arr[0];
    var diff = Math.abs (num - curr);
    for (var val = 0; val < arr.length; val++) {
        var newdiff = Math.abs (num - arr[val]);
        if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val];
        }
    }
    return curr;
}
export const Example = {};
Example.galton = function () {
    let Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Events = Matter.Events,
        Body = Matter.Body,
        Detector = Matter.Detector,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;
    // create engine
    let engine = Engine.create({
        enableSleeping: false,
        
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

    const shootheightmax = 20;
    const shootheightmin = height / 2;
    const shootheight = shootheightmin - shootheightmax;

    const size = 4;
    let total = 1000;
    const speed = 10;

    // const size = 20;
    // let total = 20;
    // const speed = 5;


    const plotPixel = (x, y, brightness) => {
        World.add(world, Bodies.rectangle(x,y,1,1, {
            isStatic: true,
            render: {
                fillStyle: "#ffffff",
                visible: true,
                opacity: brightness
            },
            collisionFilter: {
                group: 0,
            }
        }));
    };

    function plot(ipart, round, fpart, rfpart, x, y, x2, y2) {
    
        const steep = Math.abs(y2 - y) > Math.abs(x2 - x);
        if (steep) {
            [x, y] = [y, x];
            [x2, y2] = [y2, x2];
        }
        if (x > x2) {
            [x, x2] = [x2, x];
            [y, y2] = [y2, y];
        }
    
        const dx = x2 - x;
        const dy = y2 - y;
        const gradient = dy / dx;
    
        let intery = y + rfpart(x) * gradient;
        for (let xi = ipart(x) + 1; xi < round(x2); xi++) {
            if (steep) {
                plotPixel(ipart(intery), xi, rfpart(intery));
                plotPixel(ipart(intery) + 1, xi, fpart(intery));
            } else {
                plotPixel(xi, ipart(intery), rfpart(intery));
                plotPixel(xi, ipart(intery) + 1, fpart(intery));
            }
            intery += gradient;
        }
    }
    
    function drawLine(x1, y1, x2, y2) {
        const ipart = Math.floor;
        const round = Math.round;
        const fpart = x => x - Math.floor(x);
        const rfpart = x => 1 - fpart(x);
    
        plot(ipart, round, fpart, rfpart, x1, y1, x2, y2);
        plot(ipart, round, fpart, rfpart, x2, y2, x1, y1);
        plotPixel(x1, y1, 1);
        plotPixel(x2, y2, 1);
    }
    // const size = 10;
    // let total = 20;
    // const speed = 5;

    const distribution = 'laplace';
    engine.gravity.y = 0;
    
    let pegxf = {};
    let pegx = {};
    let pegy = [];
    let miny = Infinity;
    let maxy = 0;
    for (let i = 0; i < width/size; i++) {
        const x = i * size;
        // const cdf = dists[distribution].cdf((x - width/2)/40, mu, sigma);
        const cdf = bimodalCDF((x - width/2)/40);
        let y = shootheightmin - cdf * shootheight;

        pegx[y] = x;
        if (y < miny) {
            miny = y;
        }
        if (y > maxy) {
            maxy = y;
        }
        pegy.push(y);

    }

    for (let i = 0; i < width/size; i++) {
        const x = i * size;
        const y = (maxy - pegy[i]) *  (shootheightmax - shootheightmin) / (maxy - miny) + shootheightmin;
        const peg = Bodies.rectangle(x, y, size, size, {
            isSensor: true,
            isStatic: true,
            render: {
                fillStyle: "#ff00ff",
                visible: false
            },
            collisionFilter: {
                group: 0,
            }
        });
        pegy[i] = y;
        pegx[y] = x;
        World.add(world, peg);
        if (i > 0) {
            drawLine(pegx[pegy[i-1]], pegy[i-1], pegx[pegy[i]], pegy[i]);
        }
    }
    
    let shoots = {};
    Events.on(runner,  'beforeTick', function(event) {
        // loop through all moving bodies with velocity x > 0
        for (let i = 0; i < world.bodies.length; i++) {
            const body = world.bodies[i];
            if (body.velocity.x > 0 && !body.isStatic) {
                const x = body.position.x;
                const y = body.position.y;
                const pegcx = shoots[body.id];
                if (x >= pegcx) {
                    Body.setPosition(body, { x: pegcx, y: y });
                    Body.setVelocity(body, { x: 0, y: speed });
                }
            }
        }
        // loop through all moving bodies with velocity y > 0 and stack them on the floor
        for (let i = 0; i < world.bodies.length; i++) {
            const body = world.bodies[i];
            if (body.velocity.y > 0 && !body.isStatic) {
                const x = body.position.x;
                const y = body.position.y;
                // verify that the x position is already registered
                if ((pegxf[x] && (y >= height - pegxf[x] - size/2)) || y >= (height - size/2)) {
                    if (!pegxf[x]) {
                        pegxf[x] = size / 2;
                    } 
                    Body.setPosition(body, { x: x, y: height - pegxf[x]});
                    Body.setStatic(body, true);
                    pegxf[x] += size;
                }
            }
        }
    });

    setInterval(() => {
        if (total-- > 0) {
            const unifm1p1 = Math.random();
            const unidisc = unifm1p1 * (maxy - miny) + miny;

            const square = Bodies.rectangle(
                10, unidisc
                , size, size, {
                isSensor: true,
                frictionAir: 0,
                render: {
                    fillStyle: "#ff00ff",
                    visible: true
                },
                collisionFilter: {
                    group: 0,
                },
            });
            square.id = "square" + total;
            shoots[square.id] = pegx[closest(unidisc, pegy)];
            Body.setVelocity(square, { x: speed, y: 0 });
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

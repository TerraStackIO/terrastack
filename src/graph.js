// Sort items in a graph using a topological sort into chunks

const Component = require("./component");

const graphSimpleSequencer = require("graph-simple-sequencer");
const TrailDuck = require("trailduck").default;
console.log(TrailDuck);
const exec = a => {
  return new Promise((resolve, reject) => {
    console.log(`task: ${a.foo()}`);
    setTimeout(() => {
      resolve();
    }, 2500);
  });
};

const a = new Component("a");
const b = new Component("b");
const c = new Component("c");
const d = new Component("d");

let set = new Set([a, b, c, d, a, b]);
console.log({ set });

let graph = new Map([[a, [d]], [b, [d, a]], [c, [d]], [d, [a]], [b, [c]]]);

let { safe, chunks } = graphSimpleSequencer(graph);

console.log({ safe, chunks });

(async () => {
  for (let chunk of chunks) {
    // Running tasks in parallel
    await Promise.all(chunk.map(task => exec(task)));
  }
})();

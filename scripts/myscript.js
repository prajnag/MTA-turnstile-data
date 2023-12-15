// visualization.js

let currPtr = 0;
var bardata = new Array(24).fill(null).map(() => ({
  '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0,
  'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0, 'G': 0,
  'J': 0, 'L': 0, 'M': 0, 'N': 0, 'Q': 0, 'R': 0, 'S': 0,
  'W': 0, 'Z': 0,
}));

const w = 800;
const h = 600;
const margin = { top: 25, right: 0, bottom: 25, left: 25 };
const innerWidth = w - margin.left - margin.right;
const innerHeight = h - margin.top - margin.bottom;

const svg = d3.select("div#plot")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

let xScale, yScale;

function dataParser(tsq, routeParam,ridership) {
  let ts = parseInt(tsq.split(' ')[1]);
  let ampm = tsq.split(' ')[2];
  let routes = routeParam.split(',');
  routes.forEach(route => {
    if(route in bardata[0]){
      bardata[ampm === "PM" ? (ts - 1) + 12 : ts - 1][route] += parseInt(ridership)
    }

  });
}

d3.csv('https://raw.githubusercontent.com/prajnag/MTA-turnstile-data/main/mtadata.csv').then(function(data) {
  // Process the data
  data.forEach(row => {
    dataParser(row.transit_timestamp, row.routes,row.ridership);
  });

  // Once the data is loaded and processed, call update to create the chart
  update();
});

function update() {
  let data = Object.values(bardata[currPtr]);

  xScale = d3.scaleBand()
      .domain(Object.keys(bardata[currPtr]))
      .range([0, innerWidth])
      .paddingInner(0.1);

  yScale = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([innerHeight, 0]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.selectAll(".xAxis").remove();
  svg.selectAll(".yAxis").remove();

  svg.append("g")
      .attr("class", "xAxis")
      .attr("transform", `translate(${margin.left}, ${h - margin.bottom})`)
      .call(xAxis)
      .append("text") // Adding label for X axis
    .attr("class", "Ridership")
    .attr("text-anchor", "end")
    .attr("x", innerWidth)
    .attr("y", -6)
    .text("Routes");

  svg.append("g")
      .attr("class", "yAxis")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .call(yAxis)
      .append("text") // Adding label for Y axis
    .attr("class", "Routes")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", "20px")
    .attr("transform", "rotate(-90)")
    .text("Count");

  var bars = svg.selectAll(".bar")
      .data(data);

  bars.enter()
      .append("rect")
      .merge(bars)
      .attr("class", "bar")
      .attr("x", (d, i) => xScale(Object.keys(bardata[currPtr])[i]))
      .attr("y", d => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d))
      .attr("fill", "green")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  bars.exit().remove();
}



function animate() {
  currPtr = (currPtr + 1) % 24;
  document.getElementById("clock").textContent = `${currPtr % 12 == 0 ? 12 : currPtr % 12}:00 ${currPtr < 12 ? "AM" : "PM"}`
  update();
}

setInterval(animate, 2000);

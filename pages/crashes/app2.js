var CTPS = {};
CTPS.demoApp = {};

var projection = d3.geo.conicConformal()
	.parallels([41 + 43 / 60, 42 + 41 / 60])
    .rotate([71 + 30 / 60, -41 ])
	.scale([20000]) // N.B. The scale and translation vector were determined empirically.
	.translate([65,830]);
	
var geoPath = d3.geo.path().projection(projection);	

//Using the queue.js library
queue()
	.defer(d3.json, "../../json/boston_region_mpo_towns.topo.json")
	.defer(d3.json, "../../json/motorized_crashes.json")
	.awaitAll(function(error, results){ 
		CTPS.demoApp.generateMap(results[0],results[1]);
		CTPS.demoApp.generatePlot(results[1]);
		CTPS.demoApp.generateTruck(results[1]);
		CTPS.demoApp.generateAccessibleTable(results[1]);
	}); 

//Color Scale
var colorScale = d3.scale.linear()
    .domain([0, 25, 50, 100, 200, 400, 800])
    .range(["#9e0142", "#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf"].reverse());

//var colorScale = d3.scale.linear().domain([0, 20, 100, 200]).range(["#ffffcc", "#f9bf3b","#ff6347", "#ff6347"]);

var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
	    return d.properties.TOWN ;
	  })

////////////////* GENERATE MAP *////////////////////
CTPS.demoApp.generateMap = function(mpoTowns, crashdata) {	
	// SVG Viewport

	var svgContainer = d3.select("#map").append("svg")
		.attr("width", "100%")
		.attr("height", 450)

	svgContainer.call(tip); 

	var findIndex = function(town, statistic) { 
		for (var i = 0; i < crashdata.length; i++) { 
			if (crashdata[i].year == 2013 && crashdata[i].town == town) {
				return crashdata[i][statistic]; 
			} 
		}
	}

	var mapcSVG = svgContainer.selectAll(".mpo")
		.data(topojson.feature(mpoTowns, mpoTowns.objects.collection).features)
		.enter()
		.append("path")
			.attr("class", function(d){ return d.properties.TOWN.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})})
			.attr("d", function(d, i) {return geoPath(d); })
			.style("fill", function(d){ 
				var capTown = d.properties.TOWN.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
				return colorScale(findIndex(capTown, "mot_inj")); 	
			})
			.style("opacity", 1)
			.style("stroke", "#191b1d")
			.style("stroke-width", "1px")
		.on("click", function() {
				var thisreg = this.getAttribute("class");
				var yScale = d3.scale.linear().domain([0, findTownMax(thisreg)[0]]).range([400, 20]);
				var yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(-250, 0, 0).tickFormat(d3.format("d"));

				d3.selectAll(".area").transition()
					.style("fill", "none");

				chartContainer.select(".yaxis").transition()
					.duration(750)
					.ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                    .call(yAxis).selectAll("text").style("fill", colorScale(findTownMax(thisreg)[0]))
                    .attr("transform", "translate(-5,0)");

				var yScale = d3.scale.linear().domain([0, findTownMax(thisreg)[1]]).range([400, 20]);
				var yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(-250, 0, 0).tickFormat(d3.format("d"));
                chartContainer2.select(".yaxis").transition()
					.duration(750)
					.ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                    .call(yAxis).selectAll("text").style("fill", colorScale(findTownMax(thisreg)[1]))
                    .attr("transform", "translate(-5,0)");

                circleMaker(thisreg);
	        }) 
		.on("mouseenter", function(d) { 
			tip.show(d); 
		})
	
	var chartContainer = d3.select("#motChart").append("svg")
		.attr("width", "100%")
		.attr("height", 500)

	var chartContainer2 = d3.select("#truckChart").append("svg")
		.attr("width", "100%")
		.attr("height", 500)

	var nested_crashes = d3.nest()
	.key(function(d) { return d.town})
	.entries(crashdata);

	//Determine scales dynamically
	function findTownMax(town) { 
		var crashvalues = [];
		crashvalues[0] = [];
		crashvalues[1] = [];

		nested_crashes.forEach(function(i) { 
			if (i.key == town) {
				i.values.forEach(function(j){
					crashvalues[0].push(j.mot_inj);
					crashvalues[1].push(+j.trk_inj);
				})
			}
		})

		return [d3.max(crashvalues[0]), d3.max(crashvalues[1])];
	}
//Label axes
	chartContainer.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -270)
		.attr("y", 10)
		.style("font-weight", 300)
		.text("Number of Injuries")

	chartContainer2.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -270)
		.attr("y", 10)
		.style("font-weight", 300)
		.text("Number of Injuries")

//Assign scales and axes 
	var xScale = d3.scale.linear().domain([2004, 2013]).range([50, 300]);
	var yScale = d3.scale.linear().domain([0, findTownMax("Total")[0]]).range([400, 20]);

	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10).tickFormat(d3.format("d")); 
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10).tickSize(-250, 0, 0);

	chartContainer.append("g").attr("class", "axis")
		.attr("transform", "translate(0, 400)").style("stroke-width", "1px")
		.call(xAxis).selectAll("text").style("font-size", "12px").style("text-anchor", "end").attr("transform", "rotate(-45)");
	
	chartContainer.append("g").attr("class", "yaxis")
		.attr("transform", "translate(50, 0)")
		.call(yAxis).selectAll("text").style("font-size", "12px")
		.attr("transform", "translate(-5,0)");

	var yScale = d3.scale.linear().domain([0, findTownMax("Total")[1]]).range([400, 20]);
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10).tickSize(-250, 0, 0);

	chartContainer2.append("g").attr("class", "axis")
		.attr("transform", "translate(0, 400)").style("stroke-width", "1px")
		.call(xAxis).selectAll("text").style("font-size", "12px").style("text-anchor", "end").attr("transform", "rotate(-45)");
	
	chartContainer2.append("g").attr("class", "yaxis")
		.attr("transform", "translate(50, 0)")
		.call(yAxis).selectAll("text").style("font-size", "12px")
		.attr("transform", "translate(-5,0)");


	circleMaker("Total");

	function circleMaker (town) {
		//graph connecting lines
		nested_crashes.forEach(function(i) { 
			i.values.forEach(function(j) { 
				if (j.town == town) {
					var yScale = d3.scale.linear().domain([0, findTownMax(town)[0]]).range([400, 20]);

					var areamaker = d3.svg.area() //mot injuries
					    .x(function(d) { return xScale(d.year); })
					    .y1(function(d) { return yScale(d.mot_inj); })
					    .y0(function(d) { return yScale(0)});

					chartContainer.append("path")
				      .datum(i.values)
				      .attr("class", "area")
				      .attr("d", areamaker)
				      .style("fill", colorScale(findTownMax(i.key)[0]))
				      .style("stroke", "none")
				      .style("opacity", .1);

				    var yScale = d3.scale.linear().domain([0, findTownMax(town)[1]]).range([400, 20]);

			        var areamaker2 = d3.svg.area() //mot injuries
				      .x(function(d) { return xScale(d.year); })
				      .y1(function(d) { return yScale(+d.trk_inj); })
				      .y0(function(d) { return yScale(0)});

				    chartContainer2.append("path")
				      .datum(i.values)
				      .attr("class", "area")
				      .attr("d", areamaker2)
				      .style("fill", colorScale(findTownMax(i.key)[1]))
				      .style("stroke", "none")
				      .style("opacity", .1);
				}
			})
		})

		
	}

	 //Color key
    var xPos = 5;
    var yPos = 30; 
    var height = 600; 
    //background
    svgContainer.append("text")
      .style("font-weight", 700)
      .attr("x", xPos).attr("y", yPos -7)
      .text("KEY");
    //text and colors
    svgContainer.append("rect")
      .style("fill", colorScale(50)).style("stroke", "none").style("opacity", .1)
      .attr("x", xPos).attr("y", yPos).attr("height", "7px").attr("width", height/35);
    svgContainer.append("text")
      .style("font-weight", 300)
      .attr("x", xPos + 25).attr("y", yPos + 7)
      .text("<50 crashes");
    svgContainer.append("rect")
      .style("fill", colorScale(120)).style("stroke", "none")
      .attr("x", xPos).attr("y", yPos + 15).attr("height", "7px").attr("width", height/35);
    svgContainer.append("text")
      .style("font-weight", 300)
      .attr("x", xPos + 25).attr("y", yPos + 22)
      .text("51-200 crashes");
    svgContainer.append("rect")
      .style("fill", colorScale(250)).style("stroke", "none")
      .attr("x", xPos).attr("y", yPos + 30).attr("height", "7px").attr("width", height/35);
    svgContainer.append("text")
      .style("font-weight", 300)
      .attr("x", xPos + 25).attr("y", yPos + 37)
      .text("201-400 crashes");
    svgContainer.append("rect")
      .style("fill", colorScale(450)).style("stroke", "none")
      .attr("x", xPos).attr("y", yPos + 45).attr("height", "7px").attr("width", height/35);
    svgContainer.append("text")
      .style("font-weight", 300)
      .attr("x", xPos + 25).attr("y", yPos + 52)
      .text("401-1200 crashes");
    svgContainer.append("rect")
      .style("fill", colorScale(1200)).style("stroke", "none")
      .attr("x", xPos).attr("y", yPos + 60).attr("height", "7px").attr("width", height/35);
    svgContainer.append("text")
      .style("font-weight", 300)
      .attr("x", xPos + 25).attr("y", yPos + 67)
      .text(">1200 crashes");

}

CTPS.demoApp.generatePlot = function (crashdata) {

	var height = 750;
	var width = 1100;
	var padding = 10;

	var nested_crashes = d3.nest()
		.key(function(d) { return d.town})
		.entries(crashdata);

	var svg = d3.select("#plot").append("svg")
				.attr("height", height)
				.attr("width", width);

	var xScale = d3.scale.linear().domain([0, 151]).range([0 + padding, width - 50]);
	var yScale = d3.scale.linear().domain([0, 131]).range([height + 150, 10]);

	var xAxis = d3.svg.axis().scale(xScale).tickSize(0);
	var yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(0);

	svg.append("g")
	  .attr("class", "taxis")
	  .attr("transform", "translate(0, " + (height - padding) + ")")
	  .call(xAxis).selectAll("text").remove();

	svg.append("g")
		.attr("class", "taxis")
		.attr("transform", "translate(" + padding + ", 0)")
		.call(yAxis).selectAll("text").remove();

	crashdata.forEach(function(d){
		if (d.year == 2013 && d.town == "Total") { 
			var x = 1; 
			var y = 130; 
			
			for(var i = 1; i < d.mot_fat+1; i++) { 
				svg.append("circle")  
					.attr("cx", xScale(x))
					.attr("cy", yScale(y))
					.attr("r", 2.8)
					.attr("fill", "#e7298a")
				if (x == 150) { x = 1; y--; } else { x++; }
			}
			for(var i = 1; i < d.mot_inj+1; i++) { 
				svg.append("circle")  
					.attr("cx", xScale(x))
					.attr("cy", yScale(y))
					.attr("r", 2.8)
					.attr("stroke-width", .5)
					.attr("stroke", "#e7298a")
					.attr("fill", "none")
				if (x == 150) { x = 1; y--; } else { x++; }
			}
		}
	});	
}

CTPS.demoApp.generateTruck = function(crashdata) { 
	var height = 770;
	var width = 1100;
	var padding = 50;

    var year = 0; 
	var x = 1; 
	var y = 40;
	var tot = 0;
	var xMax = 71;

	var nested_crashes = d3.nest()
		.key(function(d) { return d.town})
		.entries(crashdata);

	var svg = d3.select("#trucks").append("svg")
				.attr("height", height)
				.attr("width", width);

	var xScale = d3.scale.linear().domain([2004, 2013]).range([0 + padding, width - (2.5 * padding)]);
	var yScale = d3.scale.linear().domain([100, 0]).range([height - 100, 10]);

	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10).tickFormat(d3.format("d")); 

	svg.append("g")
	  .attr("class", "taxis")
	  .attr("transform", "translate(0, 665)")
	  .call(xAxis)
	  .selectAll("text")
	  .style("font-size", 18)
	  .attr("transform", "translate(35, 3)")
	  .style("text-anchor", "middle");

	crashdata.sort(function(a, b){ return parseInt(a.year) - parseInt(b.year); });
	 

	crashdata.forEach(function(d){
		if (year != d.year) { 
			x = 1; 
			y = 99; 
			year = d.year; 
		}

		if (d.town == "Total") {
			
			for(var i = 1; i < parseInt(d.trk_inj) + 1; i ++) { 
				svg.append("circle")  
					.attr("cx", xScale(d.year) + x)
					.attr("cy", yScale(y))
					.attr("r", 2.8)
					.attr("stroke-width", .5)
					.attr("stroke", "orange")
					.attr("fill", "none")
				if (x == xMax) { x = 1; y--; } else { x += 7; }
			}

			for(var i = 1; i < parseInt(d.trk_fat) + 1; i ++) { 
				svg.append("circle")  
					.attr("cx", xScale(d.year) + x)
					.attr("cy", yScale(y))
					.attr("r", 2.8)
					.attr("fill", "orange")
				if (x == xMax) { x = 1; y--; } else { x += 7; }
			}
			svg.append("text")  
				.attr("x", xScale((d.year + d.year + 1)/ 2) - 15)
				.attr("y", yScale(100) + 45)
				.text(+d.trk_fat + " Fatalities")
				.style("font-weight", 300)
				.style("text-anchor", "middle")

			svg.append("text")  
				.attr("x", xScale((d.year + d.year + 1)/ 2) - 15)
				.attr("y", yScale(100) + 65)
				.text(+d.trk_inj + " Injuries")
				.style("font-weight", 300)
				.style("text-anchor", "middle")
		}

	});	
}

CTPS.demoApp.generateAccessibleTable = function(crashjson){
	var colDesc = [{ // array of objects
		"dataIndex" : "year",
		"header" : "Year"
	},{ 
		"dataIndex" : "town",
		"header" : "Town"
	},{ 
		"dataIndex" : "mot_inj",
		"header" : "mot Injuries"
	},{ 
		"dataIndex" : "mot_fat",
		"header" : "mot Fatalities"
	}];

	var options = {
		"divId" : "crashTableDiv",
		"caption": "Nonmotorized Crash Data over Time: Bicycle and trkestrian Injuries and Fatalities from 2004 to 2013",
	};

	$("#crashTable").accessibleGrid(colDesc, options, crashjson);
}

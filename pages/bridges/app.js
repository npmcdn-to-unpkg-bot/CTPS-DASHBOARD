var CTPS = {};
CTPS.demoApp = {};

//Define Color Scale
var colorScale = d3.scale.linear()
	.domain([0, .5, 1])
	.range(["#ff6347","#ffffbf","#1a9850"])


var projection = d3.geo.conicConformal()
	.parallels([41 + 43 / 60, 42 + 41 / 60])
    .rotate([71 + 30 / 60, -41 ])
	.scale([25000]) // N.B. The scale and translation vector were determined empirically.
	.translate([100,1000]);
	
var geoPath = d3.geo.path().projection(projection);	

//Using the queue.js library
queue()
	.defer(d3.json, "../../JSON/bridge_condition_timeline.JSON")
	.awaitAll(function(error, results){ 
		CTPS.demoApp.generateBridgeTimeline(results[0]);
		//CTPS.demoApp.generateBridgePlots(results[0]);
	}); 

CTPS.demoApp.generateBridgeTimeline = function(bridges) {

	var cleanedbridges = []; 
	bridges.forEach(function(i){
		if (i.healthIndex != -1) {
			cleanedbridges.push ({
				"bridgeId" : i.bridgeId,
				"healthIndex" : +i.healthIndex * 100,
				"overFeature" : i.overFeature, 
				"underFeature" : i.underFeature,
				"adt" : +i.adt,
				"year" : +i.year,
				"structDef" : i.structDef,
				"town": i.town
			})
		}
	})

	var nested_towns = d3.nest()
		.key(function(d) { return d.town})
		.entries(cleanedbridges);

	nested_towns.sort(function(a, b){
		var nameA = a.key; 
		var nameB = b.key; 
		if (nameA < nameB) {return -1;}
		if (nameA > nameB) {return 1;}
		return 0;
	})

	nested_towns.forEach(function(i) {

		var nested_struct_def = d3.nest() 
			.key(function(j) { return j.year })
			.entries(i.values) 

		var structdefs = [];

		//count bridges
		nested_struct_def.forEach(function(k){ 
			var countT = 0; 
			var countF = 0; 
			var elseCount = 0; 
			healthavg = 0; 

			k.values.forEach(function(n){ 
				if ( n.structDef == "TRUE" || n.structDef == "True") { countT++;}
				if ( n.structDef == "FALSE" || n.structDef == "False") { countF++; }
				elseCount++;
				healthavg += +n.healthIndex; 
			})

			structdefs.push({
				"year" : +k.key, 
				"structDef" : countT, //# structurally def bridges
				"structDefNOT" : countF, //# good bridges
				"totalCount" : elseCount, //# all bridges
				"healthavg" : healthavg/elseCount
			})
			//placeholders: 
		})

		if (d3.max(structdefs, function(d) { return d.year}) != 2016 ) { 
			structdefs.push( { "year": 2016, "structDef": 200, "structDefNOT": 1000, "totalCount": 1200, "healthavg": 80});
		}
		if (d3.min(structdefs, function(d) { return d.year}) != 2007 ) { 
			structdefs.push( { "year": 2007, "structDef": 200, "structDefNOT": 1000, "totalCount": 1200, "healthavg": 80});
		}

		structdefs.sort(function(a,b){ 
			var nameA = a.year;
			var nameB = b.year; 
			if (nameA < nameB) { return -1 }
			if (nameA > nameB) { return 1 }
			return 0; 
		})

		i.dataArray = structdefs;
	})

	var towns = [];
	cleanedbridges.forEach(function(d) { 
		if (towns.indexOf(d.town) == -1) { towns.push(d.town)}
	})
	towns.sort();

	nested_struct_def = d3.nest() 
	.key(function(i) { return i.year })
	.entries(bridges) 

	var allBridges = []; //array stores cumlative structural deficient bridges and health index
	nested_struct_def.forEach(function(i){ 
		var countT = 0; 
		var countF = 0; 
		var elseCount = 0; 
		var healthCount = 0; 
		var healthPoints = 0; 
		var sdHealth = 0; //health for sd bridges
		var nsdHealth = 0; //health for nsd bridges
		var sdHealthCount = 0; //number for health sd bridges
		var nsdHealthCount = 0; //number for health nsd bridges

		i.values.forEach(function(j){ 
			if ( (j.structDef == "TRUE" || j.structDef == "True") && j.healthIndex != -1) { 
				countT++;
				sdHealth += +j.healthIndex;
				sdHealthCount++; 
				}
			if ( (j.structDef == "FALSE" || j.structDef == "False") && j.healthIndex != -1) { 
				countF++; 
				nsdHealth += +j.healthIndex;
				nsdHealthCount ++; 
			}
			if (j.healthIndex != -1) { 
				healthPoints++;
				healthCount += +j.healthIndex;
				elseCount++; 
			}
		})

		allBridges.push({
			"year" : +i.key, 
			"structDef" : countT, //# structurally def bridges
			"structDefNOT" : countF, //#good bridges
			"totalCount" : elseCount, //# good bridges
			"healthavg" : healthCount * 100 / healthPoints
		})
		
	})

	allBridges.sort(function(a,b){ 
		var nameA = a.year;
		var nameB = b.year; 
		if (nameA < nameB) { return -1 }
		if (nameA > nameB) { return 1 }
		return 0; 
	})

	nested_ind_bridge = d3.nest()
	.key(function(i) { return i.bridgeId;})
	.entries(cleanedbridges);

	var timeline = d3.select("#timeline").append("svg")
	.attr("width", "100%")
	.attr("height", 600)

	//Assign scales and axes 
	xScale = d3.scale.linear().domain([2007, 2016]).range([70, 400]);
	yScale = d3.scale.linear().domain([0, 100]).range([450, 50]);

	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.format("d"));
	var yAxis = d3.svg.axis().scale(yScale).orient("left");

	timeline.append("text")
		.attr("x", -350)
		.attr("y", 20)
		.attr("transform", "rotate(-90)")
		.text("% Bridges, Average Health Index")

	timeline.append("g").attr("class", "axis")
		.attr("transform", "translate(0, 450)")
		.call(xAxis)
		.selectAll("text")
		.style("font-size", "12px").style("text-anchor", "end").attr("transform", "rotate(-45) translate(-5, -5)");
	
	timeline.append("g").attr("class", "axis")
		.attr("transform", "translate(70, 0)")
		.call(yAxis)
		.selectAll("text")
		.attr("transform", "translate(-5, 0)");

	//Line for average health index
	var valueline = d3.svg.line()
		.interpolate("basis")
	    .x(function(d) { return xScale(d.year); })
	    .y(function(d) { return yScale(d.healthavg); });

	//Areas for structural deficient and not so
	var goodline = d3.svg.area()
		.interpolate("basis")
	    .x(function(d) { return xScale(d.year); })
	    .y1(function(d) { return yScale(100 * d.structDef/d.totalCount); })
	    .y0(yScale(100));

	var badline = d3.svg.area()
		.interpolate("basis")
	    .x(function(d) { return xScale(d.year); })
	    .y1(function(d) { return yScale(100 * d.structDef/d.totalCount); })
	    .y0(yScale(0));

	makeTimeline(allBridges);

	function makeTimeline(townData) {
		timeline.selectAll("path").filter(".charted").remove();

		timeline.append("path")
			.attr("class", "charted")
			.attr("d", goodline(townData))
			.style("stroke-width", 0)
			.style("fill", colorScale(.8))
			.style("opacity", .2)

		timeline.append("path")
			.attr("class", "charted")
			.attr("d", badline(townData))
			.style("stroke-width", 0)
			.style("fill", colorScale(0))
			.style("opacity", .8)

		timeline.append("path")
			.attr("class", "charted")
			.attr("d", valueline(townData))
			.style("stroke", "#ddd")
			.style("fill", "none")
			.style("stroke-width", 3)
			.style("opacity", .8)

	} //end makeTimeline

	//Key
	timeline.append("text")
		.attr("x", 70)
		.attr("y", 520)
		.text("KEY: ")

	timeline.append("text")
			.attr("x", 220)
			.attr("y", 595)
			.text("% structurally deficient bridges")
			.style("font-weight", 300)
			.style("font-size", 12)

	timeline.append("rect")
		.attr("x", 140)
		.attr("y", 540)
		.attr("width", 50)
		.attr("height", 60)
		.style("fill", colorScale(.8))
		.style("opacity", .2)

	timeline.append("text")
			.attr("x", 220)
			.attr("y", 560)
			.text("% non structurally deficient bridges")
			.style("font-weight", 300)
			.style("font-size", 12)

	timeline.append("path")
		.attr("d", "M 195 540 L 210 540 L 210 578 L 195 578")
		.style("stroke", "#ddd")
		.style("fill", "none")

	timeline.append("path")
		.attr("d", "M 195 582 L 210 582 L 210 600 L 195 600")
		.style("stroke", "#ddd")
		.style("fill", "none")

	timeline.append("rect")
		.attr("x", 140)
		.attr("y", 580)
		.attr("width", 50)
		.attr("height", 20)
		.style("fill", colorScale(0))
		.style("opacity", .8)

	timeline.append("text")
			.attr("x", 115)
			.attr("y", 550)
			.text("Average")
			.style("font-weight", 300)
			.style("font-size", 12)
			.style("text-anchor", "end")

	timeline.append("text")
			.attr("x", 115)
			.attr("y", 565)
			.text("health index")
			.style("font-weight", 300)
			.style("font-size", 12)
			.style("text-anchor", "end")

	timeline.append("rect")
		.attr("x", 140)
		.attr("y", 550)
		.attr("width", 50)
		.attr("height", 3)
		.style("fill", "#ddd")
		.style("opacity", 1)

	timeline.append("path")
		.attr("d", "M 120 557 L 135 557")
		.style("stroke", "#ddd")
		.style("fill", "none")
 	/* 
 	Second Visualization (Timeline)
 	*/

	var timeline2 = d3.select("#timeline2").append("svg")
	.attr("width", "100%")
	.attr("height", 600)
	.style("overflow", "visible");

	var xScaleT = d3.scale.linear().domain([2007, 2016]).range([20, 500]);
	var yScaleT = d3.scale.linear().domain([0, 100]).range([450, 50]);

	var xAxisT = d3.svg.axis().scale(xScaleT).orient("bottom").tickFormat(d3.format("d"));//.tickSize(-400, 0, 0)
	var yAxisT = d3.svg.axis().scale(yScaleT).orient("left")//.tickSize(-600, 0, 0);

	timeline2.append("g").attr("class", "axis")
		.attr("transform", "translate(0, 450)")
		.call(xAxisT)
		.selectAll("text")
		.style("text-anchor", "middle")
		.attr("transform", "translate(27, 0)");
	
	timeline2.append("g").attr("class", "axis")
		.attr("transform", "translate(20, 0)")
		.call(yAxisT)
		.selectAll("text")
		.attr("transform", "translate(-5, 0)");

	bridgePoints();
	//plot individual points
	function bridgePoints() {
		cleanedbridges.forEach(function(i){

			timeline2.append("rect")
				.attr("class", "yr" + i.year + " bin" + d3.round(d3.round(i.healthIndex/5, 2)*100) + " individuals " + i.town.toUpperCase())
				.attr("x", function() { 
					return xScaleT(i.year) + 8 + 8 * Math.floor(Math.random() * 5)
				})
				.attr("y", yScaleT(Math.ceil(i.healthIndex)))
				//.attr("y", yScale(i.healthIndex))
				.attr("width", function() { 
					if (i.healthIndex > 0) { return 8; }
					else { return 0 }
				})
				.attr("height", 4)
				/*.style("stroke", function() { 
					if (i.structDef == "TRUE" || i.structDef == "True") { return "none";}
					else {return "#26a65b";}
				})*/
				.style("fill", function() { 
					if (i.structDef == "TRUE" || i.structDef == "True") { return "#ff6347";}
					else {return "#26a65b";}
				})
				.style("fill-opacity", function() { 
					if (i.structDef == "TRUE" || i.structDef == "True") { return .5;}
					else {return .2;}
				})
				.style("opacity", 1)
					
				/*.on("mouseenter", function(){ 
					var mystring = this.getAttribute("class");
					var arr = mystring.split(" ", 2);
					var firstWord = arr[0]; 

					d3.selectAll("." + firstWord).transition()
						.style("opacity", 0);

					d3.selectAll("." + firstWord).filter(".aggregates").transition()
						.style("opacity", 1);
				})	*/
		})
	}

	//Key
	timeline2.append("text")
		.attr("x", 70)
		.attr("y", 520)
		.text("KEY: ")

	timeline2.append("text")
		.attr("x", 90)
		.attr("y", 550)
		.text("structurally deficient bridge")
		.style("font-weight", 300)
		.style("font-size", 12)

	timeline2.append("rect")
		.attr("x", 70)
		.attr("y", 545)
		.attr("width", 8)
		.attr("height", 4)
		.style("fill", "#ff6347")
		.style("opacity", 1)

	timeline2.append("text")
		.attr("x", 90)
		.attr("y", 575)
		.text("non structurally deficient bridge")
		.style("font-weight", 300)
		.style("font-size", 12)


	timeline2.append("rect")
		.attr("x", 70)
		.attr("y", 570)
		.attr("width", 8)
		.attr("height", 4)
		.style("fill", "#26a65b")
		.style("opacity", 1)


	d3.selectAll(".townpicker").on("click", function(){
		var mystring = this.getAttribute("class");
		var arr = mystring.split(" ", 2);
		var firstWord = arr[0]; 

		if (firstWord == "ALL") { 
			timeline2.selectAll("rect").remove();

			bridgePoints();
			makeTimeline(allBridges);
		} else {
			timeline2.selectAll("rect").filter(".individuals")
				.style("opacity", .1)

			timeline2.selectAll("." + firstWord)
				.style("opacity", 1)
				.style("fill-opacity", 1)

			nested_towns.forEach(function(i) {
				if (i.key == firstWord.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})) {
					makeTimeline(i.dataArray);
				}
			})
		}
	}) //end click function
	
}


CTPS.demoApp.generateBridgePlots = function(bridges) {
	/*var bridgeContainer = d3.select("#chart").append("svg")
		.attr("width", 1200)
		.attr("height", 500);

	//mouseover function	
	var tip2 = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
	    return d.values[0].town;
	  })

	bridgeContainer.call(tip2); 

	var maxminsADT = [];*/
	var cleanedbridges = []; 
	bridges.forEach(function(i){
		//maxminsADT.push(i.adt);
			cleanedbridges.push ({
				"bridgeId" : i.bridgeId,
				"healthIndex" : +i.healthIndex,
				"overFeature" : i.overFeature, 
				"underFeature" : i.underFeature,
				"adt" : +i.adt,
				"year" : +i.year,
				"structDef" : i.structDef,
				"town": i.town
			})
	})
	

	console.log(cleanedbridges);
/*
	//var routekey = ["I90 EB", "I90 WB", "I93 NB", "I93 SB", "I95 NB", "I95 SB", "I495 NB", "I495 SB", "I290 EB", "I290 WB" ];
	//var routekey = ["I-90", "I-93", "I-95", "I495", "I290"]
	//Assign scales and axes 
	xScale = d3.scale.linear().domain([2007, 2016]).range([50, 250]);
	yScale = d3.scale.linear().domain([0, 1]).range([450, 50]);

	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.format("d")).ticks(3);
	var yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format("d"));

	bridgeContainer.append("g").attr("class", "axis")
		.attr("transform", "translate(0, 450)")
		.call(xAxis)
		.selectAll("text")
		.attr("transform", "translate(0, 5)");
	
	bridgeContainer.append("g").attr("class", "axis")
		.attr("transform", "translate(50, 0)")
		.call(yAxis)
		.selectAll("text")
		.attr("transform", "translate(-5, 0)");

	var nested_bridges = d3.nest()
	.key(function(d) { return d.bridgeId;})
	.entries(cleanedbridges);

	var valueline = d3.svg.line()
	    .x(function(d) { return xScale(d.year); })
	    .y(function(d) { return yScale(d.healthIndex); });

	cleanedbridges.forEach(function(i){    
		if (i.year == 2007 || i.year == 2016){
			bridgeContainer.append("circle")
				.attr("class", i.bridgeId)
				.attr("cx", xScale(i.year))
				.attr("cy", yScale(i.healthIndex))
				.attr("r", 2)
				.style("fill", function() { 
					if (i.structDef == "TRUE") { return "red";} 
					else {return "white"}
				})
				.style("stroke-width", 0)
				.style("opacity", 1)
		}
	})
	console.log(nested_bridges)
	nested_bridges.forEach(function(i){
		i.values.sort(function(a, b){
    		var nameA = a.year; 
    		var nameB = b.year; 
    		if (nameA < nameB) {return -1;}
    		if (nameA > nameB) {return 1;}
    		return 0;
    	})
		if (i.values.length == 2) { 
			bridgeContainer.append("path")
				.attr("class", i.key)
				.attr("d", valueline(i.values))
				.style("stroke", function() {
					if(i.values[1].healthIndex > i.values[0].healthIndex) { return "#26a65b";}
					else { return "#ff6347"; }
				})
				.style("fill", "none")
				.style("stroke-width", .5)
				.style("opacity", 1)
		}
	})*/

	var height = 35;
	var width = 70;
	var padding = 0;

	var nested_towns = d3.nest()
		.key(function(d) { return d.town})
		.entries(cleanedbridges);

	nested_towns.sort(function(a, b){
		var nameA = a.key; 
		var nameB = b.key; 
		if (nameA < nameB) {return -1;}
		if (nameA > nameB) {return 1;}
		return 0;
	})

	nested_towns.forEach(function(i) {
		var xScale = d3.scale.linear().domain([2007, 2016]).range([0 + padding, width]);
		var yScale = d3.scale.linear().domain([0, 1]).range([height, 0]);

		var xAxis = d3.svg.axis().scale(xScale).tickSize(0);
		var yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(0);

		var svg = d3.select("#chart").append("svg")
				.attr("height", height)
				.attr("width", width);
		
		svg.append("g")
		  .attr("class", "taxis")
		  .attr("transform", "translate(0, " + (height - padding) + ")")
		  .call(xAxis).selectAll("text").remove();

		svg.append("g")
			.attr("class", "taxis")
			.attr("transform", "translate(" + padding + ", 0)")
			.call(yAxis).selectAll("text").remove();
		
		/*svg.append("text")
			.attr("x", .5*(width + padding))
			.attr("y", height * 0.1)
			.style("text-anchor", "middle")
			.style("font-size", 12)
			.text(i.key);*/

		var nested_struct_def = d3.nest() 
			.key(function(j) { return j.year })
			.entries(i.values) 

		var structdefs = [];

		//count bridges
		nested_struct_def.forEach(function(k){ 
			var countT = 0; 
			var countF = 0; 
			var elseCount = 0; 
			healthavg = 0; 

			k.values.forEach(function(n){ 
				if ( n.structDef == "TRUE" || n.structDef == "True") { countT++;}
				if ( n.structDef == "FALSE" || n.structDef == "False") { countF++; }
				elseCount++;
				healthavg += +n.healthIndex; 
			})

			structdefs.push({
				"year" : k.key, 
				"structDef" : countT/elseCount, //# structurally def bridges
				"structDefNOT" : countF/elseCount, //# good bridges
				"totalCount" : elseCount, //# all bridges
				"healthIndex" : healthavg/elseCount
			})
			//placeholders: 
		})

		if (d3.max(structdefs, function(d) { return d.year}) != 2016 ) { 
			structdefs.push( { "year": 2016, "structDef": .2, "structDefNOT": .8, "totalCount": 1200, "healthIndex": .8});
		}
		if (d3.max(structdefs, function(d) { return d.year}) != 2007 ) { 
			structdefs.push( { "year": 2007, "structDef": .2, "structDefNOT": .8, "totalCount": 1200, "healthIndex": .8});
		}

		structdefs.sort(function(a,b){ 
				var nameA = a.year;
				var nameB = b.year; 
				if (nameA < nameB) { return -1 }
				if (nameA > nameB) { return 1 }
				return 0; 
			})

		var valueline = d3.svg.area()
		.interpolate("basis")
	    .x(function(d) { return xScale(d.year); })
	    .y(function(d) { return yScale(d.healthIndex); });

		var goodline = d3.svg.area()
		.interpolate("basis")
	    .x(function(d) { return xScale(d.year); })
	    .y1(function(d) { return yScale(1-d.structDefNOT); })
	    .y0(yScale(1));

		var badline = d3.svg.area()
		.interpolate("basis")
	    .x(function(d) { return xScale(d.year); })
	    .y1(function(d) { return yScale(d.structDef); })
	    .y0(yScale(0));
		
		svg.append("path")
			.attr("d", function(d) { return goodline(structdefs);})
			.style("stroke", "#26a65b")
			.style("stroke-width", 1)
			.style("fill", "#26a65b")
			.style("opacity", .8)

		svg.append("path")
			.attr("d", function(d) { return badline(structdefs);})
			.style("stroke", "#ff6347")
			.style("stroke-width", 1)
			.style("fill", "#ff6347")
			.style("opacity", .8)

		svg.append("path")
			.attr("d", function(d) { return valueline(structdefs);})
			.style("stroke", "#ddd")
			.style("fill", "none")
			.style("stroke-width", 3)
			.style("opacity", .8)	
		})

}


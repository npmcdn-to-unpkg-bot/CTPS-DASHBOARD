<!DOCTYPE html>
<head lang="en">
<meta charset="utf-8">
<title>Trip Flows in the Boston MPO Region</title>
<link rel="stylesheet" href="app.css"/>
<link rel="stylesheet" href="../../css/master.css"/>


<!-- Font Awesome -->
<script src="https://use.fontawesome.com/3b0ffee8ad.js"></script>
<!-- D3 Library --> 
<script src="https://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script src="http://d3js.org/queue.v1.min.js"></script>
<!-- Tooltip -->
<script src="http://labratrevenge.com/d3-tip/javascripts/d3.tip.v0.6.3.js"></script>
<!-- TopoJSON -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.20/topojson.min.js"></script>

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css?family=Open+Sans|Raleway:400,700" rel="stylesheet">
<!-- Jquery -->
<script src="https://code.jquery.com/jquery-3.0.0.min.js"   integrity="sha256-JmvOoLtYsmqlsWxa7mDSLMwa6dZ9rrIdtrrVYRnDRH0="   crossorigin="anonymous"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
<!-- Bootstrap-->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
<script src="https://rawgit.com/tpreusse/radar-chart-d3/master/src/radar-chart.js"></script>

<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
<style> 

.axis line, .axis path { fill: none; stroke-width: 1; stroke: #ddd; opacity: .1;} .yaxis line, .yaxis path { fill: none; stroke-width: 1; stroke: #ddd; opacity: .1;} 
text {fill: #ddd; font-size: 14px;} 

.node rect {
  cursor: move;
  fill-opacity: .9;
  shape-rendering: crispEdges;
}
 
.node text {
  pointer-events: none;
  text-shadow: 0 1px 0 #fff;
}
 
.link {
  fill: none;
  stroke: #000;
  stroke-opacity: .2;
}
 
.link:hover {
  stroke-opacity: .5;
}

</style> 
</head>

<body>

<div id="header" class="col-md-10 col-md-offset-1">
	<div class="top-nav col-md-12">
		<?php include '../../components/top-nav.php';?>
	</div>
	<div class="col-md-12">
		<h1>Trip Flows</h1>
	</div>

	<div class="col-md-12">
		<h3>Where do people travel within the Boston region?</h3>
		<p> The map below shows which the DIFFERENCE of inbound and outbound trips to a particular district.
	</div>
		<button class='highwayFlow col-md-2'> Highway</button>
		<button class='bikeFlow col-md-2'> Bike</button>
		<button class='pedFlow col-md-2'> Pedestrian</button>
		<button class='truckFlow yrpicker col-md-2'> Trucks</button>
		<button class='transitFlow yrpicker col-md-2'> Transit</button>
	<div class="col-md-6" id="map"></div>
	<div class="col-md-6" id="sankeyChart"></div>

	<div class="footer col-md-12">
		<?php include '../../components/footer.php';?>
	</div>
</div>
<script src="app.js"></script>
<script src="../../js/sankey.js"></script>

</body>
</html>
<!DOCTYPE html>
<head lang="en">
<meta charset="utf-8">
<title>Rapid Transit in the Boston MPO Region</title>
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

.axis line, .axis path { fill: none; stroke-width: 1; stroke: #ddd;} 
text {fill: #ddd; font-size: 14px;} .radar-chart .area {
  fill-opacity: 0.7;
}

</style> 
</head>

<body>

<div id="header" class="col-md-10 col-md-offset-1">
<div class="top-nav col-md-12">
	<?php include '../../components/top-nav.php';?>
</div>
	<div class="col-md-12">
		<h1>Bus Routes</h1>
	</div>

	<div class="col-md-12">
		<h3>How early/late are our busses? </h3>
		<p> The visualization below shows the average bus arrival times in May 2016.</p>
		<!--<div class="col-md-3" id="mapRoute1"></div>-->
		<div class="col-md-12" id="busses"></div>
		<h3>How long does it take to get from stop to stop? </h3>
		<p> The visualization below shows how much more or less time than the scheduled running time it takes for the Route 1 bus to travel from stop to stop. Actual running time is calculated from the average of each run throughout May 2016. </p>
		<div class="col-md-6" id="inboundStops">Inbound (Holyoke to Dudley)</div>
		<div class="col-md-6" id="outboundStops">Outbound (Dudley to Holyoke)</div>
	</div>
<!--
	<div class="col-md-12">
		<h3> MBTA Boarding loads </h3>
		<p> Down with the Big Dig!!! </p>
		<div class="col-md-6" id="mapMBTA"></div>
		<div class="col-md-6" id="graphMBTA"></div>
	</div>-->

	<div class="footer col-md-12">
		<?php include '../../components/footer.php';?>
	</div>
</div>
<script src="app.js"></script>

</body>
</html>
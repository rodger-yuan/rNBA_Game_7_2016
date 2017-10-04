var width = 700
  	height = 10000
  	s_width = 60
  	a_width = 200;

var graph = d3.select(".graph").append("svg")
  .attr("width", width)
  .attr("height", height);

var score = d3.select(".score").append("svg")
  .attr("width", s_width)
  .attr("height", height)

var annotations = d3.select(".annotations").append("svg")
  .attr("width", a_width)
  .attr("height", 21)

// y Axis Format
var padding = {x: 70, y: 20}

var formatMillisecond = d3.timeFormat(".%L"),
    formatSecond = d3.timeFormat(":%S"),
    formatMinute = d3.timeFormat("%_I:%M %p"),
    formatHour = d3.timeFormat("%_I:%M %p")
    formatDay = d3.timeFormat("%a %d"),
    formatWeek = d3.timeFormat("%b %d"),
    formatMonth = d3.timeFormat("%B"),
    formatYear = d3.timeFormat("%Y");

function multiFormat(date) {
  return (d3.timeSecond(date) < date ? formatMillisecond
      : d3.timeMinute(date) < date ? formatSecond
      : d3.timeHour(date) < date ? formatMinute
      : d3.timeDay(date) < date ? formatHour
      : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
      : d3.timeYear(date) < date ? formatMonth
      : formatYear)(date);
}

var yScale = d3.scaleTime()
  .domain([new Date(1466381400000), new Date(1466392500000)])
  .range([0, height - 2 * padding.y]);

var yAxis = d3.axisLeft(yScale)
  .ticks(d3.timeSecond.every(30))
  .tickFormat(multiFormat);

const commentFile = "data/comments_final.csv"
const pbpFile = "data/pbp.csv"

drawDotplot()
drawAnnotations()

function drawDotplot() {

	// play_by_play
	d3.csv(pbpFile, function(pbpData) {
		pbpData.forEach(function(d){
			d.epoch = new Date(+d.epoch*1000);
		})

		var lines = graph.selectAll("line")
			.data(pbpData)
			.enter().append("line")
				.style("stroke", function(d) {return player_color_pbp(d.Description)})
				.style("stroke-width", 2)
				.attr("x1", padding.x)
				.attr("x2", width - 9)
				.attr("y1", function(d) {return yScale(d.epoch);})
				.attr("y2", function(d) {return yScale(d.epoch);})
				.attr("opacity", 0.2)

		var hover_point = graph.selectAll(".hpoint")
			.data(pbpData)
			.enter().append("circle")
				.attr("cx", width - 6)
				.attr("cy", function(d) {return yScale(d.epoch);})
				.attr("r", 3)
				.style("fill", function(d) {return player_color_pbp(d.Description)})

				.on("mouseover", function(d) {
					var selcircle = d3.select(this);
			        selcircle.transition()
			          .duration(100)
			          .attr("r", 6)

			        // draw tooltip
			        pbp = graph.append("text")
			          .attr("id", "tt_play")
			          .attr("text-anchor", "end")
			          .attr("x", 675)
			          .attr("y", yScale(d.epoch)+4)
			          .attr("fill", "white")
			          .text(d.Description);

			        // get bounding box
			        bbox1 = pbp.node().getBBox();

			        graph.append("rect")
			          .attr("id", "tt_play")
			          .attr("x", bbox1.x)
			          .attr("y", bbox1.y)
			          .attr("width", bbox1.width)
			          .attr("height", bbox1.height)
			          .style("fill", "black")

			        pbp = graph.append("text")
			          .attr("id", "tt_play")
			          .attr("text-anchor", "end")
			          .attr("x", 675)
			          .attr("y", yScale(d.epoch)+4)
			          .attr("fill", "white")
			          .text(d.Description);
				})

				.on("mouseout", function(d) {
					var selcircle = d3.select(this);
					selcircle.transition()
			          .duration(100)
			          .attr("r", 3)

			        graph.selectAll("#tt_play").remove()
				})

		// scores
		bbox = {"y": 0, "height": 0}

		for (i = 0; i < pbpData.length; i++) {
			if (pbpData[i].gsw != "") {
				if ((yScale(pbpData[i].epoch)-bbox.height-3) < bbox.y) {
					gsw_score = score.append("text")
						.attr("x", 20)
						.attr("y", yScale(pbpData[i].epoch) + 15)
						.attr("id", "scoreboard")
						.attr("text-anchor", "middle")
						.attr("fill", "blue")
						.text(pbpData[i].gsw);

					bbox = gsw_score.node().getBBox();

					score.append("text")
						.attr("x", 40)
						.attr("y", yScale(pbpData[i].epoch) + 15)
						.attr("id", "scoreboard")
						.attr("text-anchor", "middle")
						.attr("fill", "maroon")
						.text(pbpData[i].cle);

					score.append("line")
						.style("stroke", "black")
						.style("stroke-width", 0.2)
						.attr("x1", 0)
						.attr("x2", 10)
						.attr("y1", yScale(pbpData[i].epoch))
						.attr("y2", yScale(pbpData[i].epoch)+10)
				} else {
					gsw_score = score.append("text")
						.attr("x", 20)
						.attr("y", yScale(pbpData[i].epoch) + 5)
						.attr("id", "scoreboard")
						.attr("text-anchor", "middle")
						.attr("fill", "blue")
						.text(pbpData[i].gsw);

					bbox = gsw_score.node().getBBox();

					score.append("text")
						.attr("x", 40)
						.attr("y", yScale(pbpData[i].epoch) + 5)
						.attr("id", "scoreboard")
						.attr("text-anchor", "middle")
						.attr("fill", "maroon")
						.text(pbpData[i].cle);

					score.append("line")
						.style("stroke", "black")
						.style("stroke-width", 0.2)
						.attr("x1", 0)
						.attr("x2", 10)
						.attr("y1", yScale(pbpData[i].epoch))
						.attr("y2", yScale(pbpData[i].epoch))
				}
			}

			// Annotations
			add_annotations(pbpData[i])
		}

		// score labels
		score.append("text")
			.attr("x", 20)
			.attr("y", 100)
			.attr("id", "scoreboard_name")
			.attr("text-anchor", "middle")
			.attr("fill", "blue")
			.text('GSW');		

		score.append("text")
			.attr("x", 40)
			.attr("y", 100)
			.attr("id", "scoreboard_name")
			.attr("text-anchor", "middle")
			.attr("fill", "maroon")
			.text('CLE');

		score.append("text")
			.attr("x", 27)
			.attr("y", 12)
			.attr("text-anchor", "middle")
			.attr("font-size", "15px")
			.text('Score');

		score.append("line")
			.attr("x1", 5)
			.attr("x2", 50)
			.attr("y1", 20.5)
			.attr("y2", 20.5) 
			.style("stroke", "black")
			.style("stroke-width", 0.75)
	})	

	// comments
	d3.csv(commentFile, function(commentData) {
		commentData.forEach(function(d){
			d.time = new Date(+d.time*1000);
		})

		//histogram binning
		const thresh = yScale.ticks(d3.timeSecond.every(10));

		const histogram = d3.histogram()
			.domain(yScale.domain())
			.thresholds(thresh)
			.value(function(d){return d.time})

		const bins = histogram(commentData);

		var xScale = d3.scaleLinear()
			.domain([0,d3.max(bins, function(d){return d.length})+1])
			.range([0, width - padding.x])

		var xAxis = d3.axisTop(xScale);

		// call axes
		graph.append("g")
		  .attr("class", "axis")
		  .attr("transform", "translate(" + padding.x + "," + padding.y +")")
		  .call(yAxis);

		graph.append("g")
		  .attr("class", "axis")
		  .attr("transform", "translate(70," + padding.y + ")")
		  .call(xAxis);

		graph.append("text")
		  .attr("x", 400)
		  .attr("y", 35)
		  .attr("opacity", 0.5)
		  .text("# comments created over real-time 10 second interval")

		// g bins for dot plot
		var gbin = graph.selectAll(".gbin")
			.data(bins)
			.enter().append("g")
				.attr("class","gbin")
				.attr("transform", function(d){return "translate(" + padding.x + "," + (padding.y + yScale(d.x0)) + ")"});

		// tooltips
		var tt_com = d3.select(".graph").append("div") 
	      .attr("class", "tooltip")
	      .attr("id", "tt_com");

		// dots
		var dots = gbin.selectAll("circle")
			.data(function(d) {
				return d.map(function(p,i) {
					return {idx: i,
							time: p.time,
							text: p.text,
							radius: (yScale(d.x1)-yScale(d.x0))/2,
							small_radius: (yScale(d.x1)-yScale(d.x0))/4
						}
				})
			})
			.enter().append("circle")
				.attr("class", "comment")
				.attr("cy", function(d) {return d.radius;})
				.attr("cx", function(d) {
					return xScale(d.idx+1);
				})
				.attr("r", function(d) {return d.small_radius;})
				.style("fill", function(d) {return player_color(d.text);})

				//tooltips
				.on("mouseover", function(d) {
					var selcircle = d3.select(this);
					tt_com.transition()    
			          .duration(200)    
			          .style("opacity", 0.9); 
			        tt_com.html(d.text)
			          .style("left", d3.event.pageX + 5 + "px")
			          .style("top", d3.event.pageY - 25 + "px"); 
			        selcircle.transition()
			          .duration(100)
			          .attr("r", function(d) {return d.radius*1.5;})
			        selcircle.raise()
				})

				.on("mouseout", function(d) {
					var selcircle = d3.select(this);
					tt_com.transition()
					  .duration(200)
					  .style("opacity", 0);
					selcircle.transition()
			          .duration(100)
			          .attr("r", function(d) {return d.small_radius;})
				})
	})
}

function drawAnnotations() {
	// title bar
	annotations.append("text")
		.attr("x", 100)
		.attr("y", 12)
		.attr("text-anchor", "middle")
		.attr("font-size", "15px")
		.text('Annotations');

	annotations.append("line")
		.attr("x1", 0)
		.attr("x2", 240)
		.attr("y1", 20.5)
		.attr("y2", 20.5) 
		.style("stroke", "black")
		.style("stroke-width", 0.75)
}

function player_color(text) {
	if (text.indexOf("bron") > -1 || 
		text.indexOf("Bron") > -1 ||
		text.indexOf("James") > -1 ||
		text.indexOf("JAMES") > -1 ||
		text.indexOf("BRON") > -1 ||
		text.indexOf("james") > -1) {
		return "red";
	}
	else if (text.indexOf("Steph") > -1 || 
		text.indexOf("steph") > -1 ||
		text.indexOf("STEPH") > -1 ||
		text.indexOf("curry") > -1 ||
		text.indexOf("Curry") > -1 ||
		text.indexOf("CURRY") > -1) {
		return "blue";
	}
	else if (text.indexOf("kyrie") > -1 || 
		text.indexOf("Kyrie") > -1 ||
		text.indexOf("KYRIE") > -1 ||
		text.indexOf("irving") > -1 ||
		text.indexOf("Irving") > -1 ||
		text.indexOf("IRVING") > -1) {
		return "aqua";
	}
	else if (text.indexOf("thompson") > -1 || 
		text.indexOf("Thompson") > -1 ||
		text.indexOf("THOMPSON") > -1 ||
		text.indexOf("klay") > -1 ||
		text.indexOf("KLAY") > -1 ||
		text.indexOf("Klay") > -1) {
		return "yellow";
	}
	else if (text.indexOf("green") > -1 || 
		text.indexOf("Green") > -1 ||
		text.indexOf("GREEN") > -1 ||
		text.indexOf("dray") > -1 ||
		text.indexOf("DRAY") > -1 ||
		text.indexOf("Dray") > -1) {
		return "lime";
	}
	else if (text.indexOf("love") > -1 || 
		text.indexOf("Love") > -1 ||
		text.indexOf("LOVE") > -1 ||
		text.indexOf("kevin") > -1 ||
		text.indexOf("Kevin") > -1 ||
		text.indexOf("KEVIN") > -1) {
		return "orange";
	}
	else if (text.indexOf("barnes") > -1 || 
		text.indexOf("Barnes") > -1 ||
		text.indexOf("BARNES") > -1 ||
		text.indexOf("harrison") > -1 ||
		text.indexOf("Harrison") > -1 ||
		text.indexOf("HARRISON") > -1) {
		return "pink";
	}
	else if (text.indexOf("jr") > -1 || 
		text.indexOf("JR") > -1 ||
		text.indexOf("Jr") > -1 ||
		text.indexOf("smith") > -1 ||
		text.indexOf("Smith") > -1 ||
		text.indexOf("SMITH") > -1) {
		return "purple";
	}
	else if (text.indexOf("shump") > -1 || 
		text.indexOf("Shump") > -1 ||
		text.indexOf("SHUMP") > -1 ||
		text.indexOf("Iman") > -1 ||
		text.indexOf("iman") > -1 ||
		text.indexOf("IMAN") > -1) {
		return "brown";
	}
	else if (text.indexOf("Varejao") > -1 || 
		text.indexOf("varejao") > -1 ||
		text.indexOf("VAREJAO") > -1 ||
		text.indexOf("anders") > -1 ||
		text.indexOf("Anders") > -1 ||
		text.indexOf("ANDERS") > -1) {
		return "orchid";
	}
	else {
		return "grey";
	}
}

function player_color_pbp(text) {
	if (text.indexOf("James") < 25 && text.indexOf("James") > 0) {
		return "red";
	}
	else if (text.indexOf("Curry") < 25 && text.indexOf("Curry") > 0) {
		return "blue";
	}
	else if (text.indexOf("Irving") < 25 && text.indexOf("Irving") > 0) {
		return "aqua";
	}
	else if (text.indexOf("[GSW") < 25 && text.indexOf("Thompson") < 25 && text.indexOf("[GSW") > 0 && text.indexOf("Thompson") > 0) {
		return "yellow";
	}
	else if (text.indexOf("Green") < 25 && text.indexOf("Green") > 0) {
		return "lime";
	}
	else if (text.indexOf("Love") < 25 && text.indexOf("Love") > 0) {
		return "orange";
	}
	else if (text.indexOf("Barnes") < 25 && text.indexOf("Barnes") > 0) {
		return "pink";
	}
	else if (text.indexOf("Smith") < 25 && text.indexOf("Smith") > 0) {
		return "purple";
	}
	else if (text.indexOf("Shumpert") < 25 && text.indexOf("Shumpert") > 0) {
		return "brown";
	}
	else if (text.indexOf("Varejao") < 25 && text.indexOf("Varejao") > 0) {
		return "orchid";
	}
	else {
		return "black";
	}
}

function html_player_color(text) {
	color = player_color(text);
	return "<span style='color:" + color + "'>" + text + "</span>"
}

function add_annotations(pbp) {
	if (pbp.Description.indexOf("(12:00) Jump Ball Ezeli vs Thompson") > -1) {
		graph.append("text")
			.attr("x", 675)
			.attr("y", yScale(pbp.epoch) - 5)
			.attr("text-anchor", "end")
			.attr("id", "annotation")
			.text('Tip-off');
		graph.append("text")
			.attr("x", 430)
			.attr("y", yScale(pbp.epoch)-2)
			.text('Hover to view the Play')
		graph.append("text")
			.attr("x", 260)
			.attr("y", yScale(pbp.epoch)-2)
			.text('Hover to view the Comment')

		//arrows
		defs = graph.append("defs")

	    var path = defs.append("marker")
	      .attr("id","arrow")
	      .attr("viewBox","0 -5 10 10")
	      .attr("refX",5)
	      .attr("refY",0)
	      .attr("markerWidth",4)
	      .attr("markerHeight",4)
	      .attr("orient","auto");

	    path.append("path")
	        .attr("d", "M0,-5L10,0L0,5")
	        .attr("class","arrowHead");

	    graph.append('line') // playmaker arrow
	      .attr("class", "arrow")
	      .attr("marker-end", "url(#arrow)")
	      .attr("x1", 555)
	      .attr("y1", yScale(pbp.epoch)-6)
	      .attr("x2", 575)
	      .attr("y2", yScale(pbp.epoch)-6);

	    graph.append('line') // playmaker arrow
	      .attr("class", "arrow")
	      .attr("marker-end", "url(#arrow)")
	      .attr("x1", 250)
	      .attr("y1", yScale(pbp.epoch)-6)
	      .attr("x2", 230)
	      .attr("y2", yScale(pbp.epoch)-6);

	} else if (pbp.Description.indexOf("(0:00) End") > -1) {
		graph.append("text")
			.attr("x", 675)
			.attr("y", yScale(pbp.epoch) - 5)
			.attr("text-anchor", "end")
			.attr("id", "annotation")
			.text('End of Quarter ' + pbp.Description[11]);
	} else if (pbp.Description.indexOf("(12:00) Start") > -1) {
		graph.append("text")
			.attr("x", 675)
			.attr("y", yScale(pbp.epoch) - 5)
			.attr("text-anchor", "end")
			.attr("id", "annotation")
			.text('Start of Quarter ' + pbp.Description[14]);
	}
}


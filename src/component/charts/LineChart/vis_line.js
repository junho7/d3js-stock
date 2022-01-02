import * as d3 from 'd3';
import _ from 'lodash';

const draw = (props) => {
    let data = [];
    if (props.data) {
        data = _.cloneDeep(props.data);

        // const tooltip = { width: 100, height: 100, x: 10, y: -30 };
        // const bisectDate = d3.bisector(function(d) { return d.date; }).left
        // const formatValue = d3.format(",")
        // const dateFormatter = d3.scaleTime.format("%Y-%m-%dT%H:%M:%SZ");
    
        d3.select('.vis-linechart > *').remove();
        let margin = { top: 20, right: 20, bottom: 30, left: 40 }
        const width = props.width - margin.left - margin.right;;
        const height = props.height - margin.top - margin.bottom;
        let svg = d3.select(".vis-linechart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        data.forEach(function (d) {
            console.log('d.Timestamp: ', d.Timestamp)
            d.date = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(d.Timestamp);
            // d.date = d.Timestamp
            // console.log(d.date)
            d.count = +d.ClosePrice;
            console.log('d.date: ', d.date)
            console.log('d.count: ', d.count)
        });
        
        // Add X axis --> it is a date format
        let x = d3.scaleTime()
            .domain(d3.extent(data, function (d) { return d.date; }))
            .range([0, width]);
        var g = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return +d.count; }), d3.max(data, function (d) { return +d.count; })])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) { return x(d.date) })
                // .y(function (d) { return y(20) })
                .y(function (d) { return y(d.count) })
            )


        // var rect = svg.selectAll("rect")
        //     .data(data)
                
        // rect.enter().append("rect")
        //     .merge(rect)
        //     .attr("class", "bar")
        //     .style("stroke", "none")
        //     .style("fill", "#ccc")
        //     .attr("x", function(d){ return x(d.date); })
        //     .attr("width", function(d){ return x.bandwidth(); })
            // .attr("y", function(d){ return height - yBar(d.bar); })
            // .attr("height", function(d){ return yBar(d.bar); });

            // bar chart
        // var bar = g.selectAll("rect")
        //     .data(data)
        //     .enter().append("g");

        //     var xScale = d3.scaleBand()
        //     .rangeRound([0, width])
        //     .padding(0.1)
        //     .domain(data.map(function(d) {
        //       return d.date;
        //     //   return d[0];
        //     }));
        //     var yScale = d3.scaleLinear()
        //                 .rangeRound([height, 0])
        //                 .domain([0, d3.max(data, (function (d) {
        //                 return d.volume;
        //                 // return d[2];
        //                 }))]);
        //   bar.append("rect")
        //     .attr("x", function(d) { return xScale(d.date); })
        //     .attr("y", function(d) { return yScale(d.volume); })
        //     // .attr("x", function(d) { return xScale(d[0]); })
        //     // .attr("y", function(d) { return yScale(d[2]); })
        //     .attr("width", xScale.bandwidth())
        //     .attr("height", function(d) { return height - yScale(d.volume); })
        //     // .attr("height", function(d) { return height - yScale(d[2]); })
        //     .attr("class", function(d) {
        //       var s = "bar ";
        //       if (d[1] < 400) {
        //         return s + "bar1";
        //       } else if (d[1] < 800) {
        //         return s + "bar2";
        //       } else {
        //         return s + "bar3";
        //       }
        //     });
        
        //   // labels on the bar chart
        //   bar.append("text")
        //     .attr("dy", "1.3em")
        //     .attr("x", function(d) { return xScale(d[0]) + xScale.bandwidth() / 2; })
        //     .attr("y", function(d) { return yScale(d[2]); })
        //     .attr("text-anchor", "middle")
        //     .attr("font-family", "sans-serif")
        //     .attr("font-size", "11px")
        //     .attr("fill", "black")
        //     .text(function(d) {
        //       return d[2];
        //     });

        // var focus = svg.append("g")
        // .attr("class", "focus")
        // .style("display", "none");

        // focus.append("circle")
        //     .attr("r", 5);

        // focus.append("rect")
        //     .attr("class", "tooltip")
        //     .attr("width", 100)
        //     .attr("height", 50)
        //     .attr("x", 10)
        //     .attr("y", -22)
        //     .attr("rx", 4)
        //     .attr("ry", 4);

        // focus.append("text")
        //     .attr("class", "tooltip-date")
        //     .attr("x", 18)
        //     .attr("y", -2);

        // focus.append("text")
        //     .attr("x", 18)
        //     .attr("y", 18)
        //     .text("Likes:");

        // focus.append("text")
        //     .attr("class", "tooltip-likes")
        //     .attr("x", 60)
        //     .attr("y", 18);

        // svg.append("rect")
        //     .attr("class", "overlay")
        //     .attr("width", width)
        //     .attr("height", height)
        //     .on("mouseover", function() { focus.style("display", null); })
        //     .on("mouseout", function() { focus.style("display", "none"); })
        //     .on("mousemove", mousemove);

        // function mousemove() {
        //     var x0 = x.invert(d3.pointer(this)[0]),
        //         i = bisectDate(data, x0, 1),
        //         d0 = data[i - 1],
        //         d1 = data[i],
        //         d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        //     focus.attr("transform", "translate(" + x(d.date) + "," + y(d.count) + ")");
        //     focus.select(".tooltip-date").text(d.date);
        //     focus.select(".tooltip-likes").text(d.count);
        // }
    }else{
        return 0
    }
}

export default draw;
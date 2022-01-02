import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";
import "moment-timezone";

const draw = (pricedata) => {

  let data = [];

//   console.log(props.data[0])
//   console.log(data)
//   console.log(oldData)

  if (pricedata?.length) {
//   if (props.data?.length) {
    data = _.cloneDeep(pricedata);
    // data = _.cloneDeep(props.data);

    d3.select(".vis-linechart > *").remove();
    var parentDiv = document.getElementsByClassName("ant-layout");
    var parentWidth = parentDiv[1].clientWidth;
    var parentHeight = parentDiv[0].clientHeight;
    let margin = { top: 20, right: 20, bottom: 40, left: 70 };
    const width = parentWidth - margin.left - margin.right - 100;
    const height = parentHeight - margin.top - margin.bottom - 55;

    let svg = d3
      .select(".vis-linechart")
      .append("svg")
      .attr("width", width + margin.left + margin.right + 100)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function (d) {
      d.date = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(d.Timestamp);
      d.count = +d.ClosePrice;
    });

    let x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return d.date;
        })
      )
      .range([0, width])
      .nice();

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("ClosePrice");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", width + margin.right + 60)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Volume");

    svg
      .append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
      )
      .style("text-anchor", "middle")
      .text("Datetime");

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([
        d3.min(data, function (d) {
          return +d.count;
        })-10,
        d3.max(data, function (d) {
          return +d.count;
        })+10,
      ])
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Bar chart
    let rect = svg.selectAll("rect").data(data);
    var xBar = d3
      .scaleBand()
      .range([0, width])
      .paddingInner(0.5)
      .paddingOuter(5);
    var yBar = d3.scaleLinear().range([height, 0]);

    xBar.domain(
      data.map(function (d) {
        return d.date;
      })
    );
    yBar
      .domain([
        0,
        d3.max(data, function (d) {
          return d.Volume;
        }),
      ])
      .nice();

    rect
      .enter()
      .append("rect")
      .merge(rect)
    //   .transition()
    //   .duration(1000)
        .attr("class", "bar")
        .style("stroke", "none")
        .style("fill", "#ccc")
        .attr("x", function (d) {
            return x(d.date) - xBar.bandwidth() / 2;
        })
        .attr("width", function (d) {
            return xBar.bandwidth();
        })
        .attr("y", function (d) {
            return yBar(d.Volume);
        })
        .attr("height", function (d) {
            return height - yBar(d.Volume);
        });

    svg.append("g").attr("class", "axisSteelBlue").call(d3.axisLeft(y));

    // Add the Y1 Axis
    svg
      .append("g")
      .attr("class", "axisRed")
      .attr("transform", "translate( " + width + ", 0 )")
      .call(d3.axisRight(yBar));

    // Add the line

    // let u = svg.selectAll("path").datum(data)

    svg
      .append("path")
      .datum(data)
      .transition()
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.date);
          })
          .y(function (d) {
            return y(d.count);
          })
      );
    
    const transitionFunc = () => {
        console.log('here')

        let line = svg.selectAll(".line")
            .data([data], function(d){return d.date})

        line
            .enter()
            .append("path")
            .attr("class", "line")
            .merge(line)
              .transition()
              .duration(1000)
              .attr("d", d3.line()
              .x(function (d) {
                return x(d.date);
              })
              .y(function (d) {
                return y(d.count);
              }))
    }

    // transitionFunc();

    var bisect = d3.bisector(function (d) {
      return d.date;
    }).left;

    var focus = svg
      .append("g")
      .append("circle")
      .style("fill", "none")
      .attr("stroke", "black")
      .attr("r", 2.5)
      .style("opacity", 0);

    var focusBox = svg
      .append("g")
      .append("rect")
      .style("fill", "grey")
      .style("stroke", "#000")
      .style("opacity", 0)
      .attr("width", 250)
      .attr("height", 70)
      .attr("x", 10)
      .attr("y", -22)
      .attr("rx", 4)
      .attr("ry", 4);

    var focusLine = svg
      .append("g")
      .append("line")
      .style("opacity", 0)
      .attr("class", "hover-line")
      .attr("stroke", "#000")
      .attr("x1", 10)
      .attr("x2", 10)
      .attr("y1", 0)
      .attr("y2", height);

    var focusText1 = svg
      .append("g")
      .append("text")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle");
    var focusText2 = svg
      .append("g")
      .append("text")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle");
    var focusText3 = svg
      .append("g")
      .append("text")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle");

    focusText1
      .append("rect")
      .attr("class", "tooltip")
      .attr("width", 100)
      .attr("height", 50)
      .attr("fill", "white")
      .attr("stroke", "#000");

    svg
      .append("rect")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);

    function mouseover() {
      focus.style("opacity", 1);
      focusBox.style("opacity", 1);
      focusLine.style("opacity", 1);
      focusText1.style("opacity", 1);
      focusText2.style("opacity", 1);
      focusText3.style("opacity", 1);
    }

    function mousemove(event) {
      let mouse_x = d3.pointer(event, this)[0];
      let xposition = -260;
      if (mouse_x < 200) {
        xposition = 20;
      }
      let x0 = x.invert(mouse_x);
      let i = bisect(data, x0, 0);
      let selectedData = data[i] ? data[i] : data[i - 1];
      focus
        .attr("cx", x(selectedData.date))
        .attr("cy", y(selectedData.ClosePrice));

      focusBox
        .attr("x", x(selectedData.date) + xposition)
        .attr("y", y(selectedData.ClosePrice) - 22);

      focusLine
        .attr("x1", x(selectedData.date))
        .attr("x2", x(selectedData.date));
      focusText1
        // .html(selectedData.date + "\n " + selectedData.ClosePrice)
        .text(
          "Datetime: " +
            moment(selectedData.date).format("yyyy-MM-DD HH:mm") +
            " " +
            moment.tz(moment.tz.guess()).zoneAbbr()
        )
        // .text(moment(selectedData.date).format('yyyy-MM-DD HH:mm'))
        // String(moment.tz(selectedData.date)).format('z')
        // .text(selectedData.ClosePrice)
        .attr("x", x(selectedData.date) + 15 + xposition)
        .attr("y", y(selectedData.ClosePrice));
      focusText2
        .text("ClosePrice: $" + selectedData.ClosePrice.toFixed(2))
        .attr("x", x(selectedData.date) + 15 + xposition)
        .attr("y", y(selectedData.ClosePrice) + 15);
      focusText3
        .text("Volume: " + selectedData.Volume.toLocaleString("en-US"))
        .attr("x", x(selectedData.date) + 15 + xposition)
        .attr("y", y(selectedData.ClosePrice) + 30);
    }
    function mouseout() {
      focus.style("opacity", 0);
      focusBox.style("opacity", 0);
      focusLine.style("opacity", 0);
      focusText1.style("opacity", 0);
      focusText2.style("opacity", 0);
      focusText3.style("opacity", 0);
    }

    // function update(data) {

    //     var u = svg.selectAll("rect")
    //       .data(data)
      
    //     u
    //       .enter()
    //       .append("rect")
    //       .merge(u)
    //       .transition()
    //       .duration(1000)
    //         .attr("x", function(d) { return x(d.group); })
    //         .attr("y", function(d) { return y(d.value); })
    //         .attr("width", x.bandwidth())
    //         .attr("height", function(d) { return height - y(d.value); })
    //         .attr("fill", "#69b3a2")

    //     rect
    //         .enter()
    //         .append("rect")
    //         .merge(rect)
    //         .attr("class", "bar")
    //         .style("stroke", "none")
    //         .style("fill", "#ccc")
    //         .attr("x", function (d) {
    //         return x(d.date) - xBar.bandwidth() / 2;
    //         })
    //         .attr("width", function (d) {
    //         return xBar.bandwidth();
    //         })
    //         .attr("y", function (d) {
    //         return yBar(d.Volume);
    //         })
    //         .attr("height", function (d) {
    //         return height - yBar(d.Volume);
    //         });


    //     var xBar = d3
    //         .scaleBand()
    //         .range([0, width])
    //         .paddingInner(0.5)
    //         .paddingOuter(5);
    //     var yBar = d3.scaleLinear().range([height, 0]);
    
    //     xBar.domain(
    //         data.map(function (d) {
    //         return d.date;
    //         })
    //     );
    //     yBar
    //         .domain([
    //         0,
    //         d3.max(data, function (d) {
    //             return d.Volume;
    //         }),
    //         ])
    //         .nice();
    

    //   }

  } else {
    return 0;
  }
};

export default draw;

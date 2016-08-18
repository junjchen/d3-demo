function draw_pv_diagram(url) {
  // 定义动画持续时间
  var duration = 300
  // 标注点最大半径
  var r_max = 30
  var parseDate = d3.time.format('%Y-%m-%d').parse

  // 定义svg
  var margin = {
      top: 20,
      right: 100,
      bottom: 30,
      left: 100
    },
    width = document.body.clientWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom

  var svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('class', 'content')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  // 定义 x y 比例尺
  var xScale = d3.time.scale()
    // .domain([0, 100])
    .range([0, width])

  var yScale = d3.scale.linear()
    // .domain([0, 100])
    .range([height, 0])

  // 标记点半径比例尺
  var rScale = d3.scale.linear()
    .range([0, 20])

  // 定义 x y 轴 及 x，y轴的网格，网格已注释掉
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .tickFormat(d3.time.format('%d'))
    .ticks(7)

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .ticks(10)

  var xGridAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')

  var yGridAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')

  // line数据转化
  var line = d3.svg.line()
    .x(function(d) {
      return xScale(d.date)
    })
    .y(function(d) {
      return yScale(d.pv)
    })
    .interpolate('monotone')

  // 开始绘图，从http://45.78.5.243:10080/提取json数据
  d3.json(url, function(error, data) {
    data.forEach(function(d) {
      d.dayText = d.date
      d.date = parseDate(d.date)
      d.pv = +d.pv
    })

    xScale.domain(d3.extent(data, function(d) {
      return d.date
    }))

    yScale.domain([0, d3.max(data, function(d) {
      return d.pv
    })])

    rScale.domain([0, d3.max(data, function(d) {
      return d.pv
    })])

    svg.append('text')
      .attr('class', 'title')
      .text('PV 图表')
      .attr('x', width / 2)
      .attr('y', 0)

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .append('text')
      .text('日期')
      .attr('transform', 'translate(' + (width - 20) + ', 0)')

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .text('次')

    svg.append('g')
      .attr('class', 'x grid')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xGridAxis.tickSize(-height, 0, 0)
        .tickFormat(''))

    svg.append('g')
      .attr('class', 'y grid')
      .call(yGridAxis.tickSize(-width, 0, 0)
        .tickFormat(''))

    svg.append('path')
      .attr('class', 'line')
      .attr('d', line(data))

    // 标注点,标注点半径绑定PV值，PV越大，点面积越大
    r = function(d) {
      return rScale(d.pv)
    }

    svg.append('g')
      .attr('class', 'linecircle')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', line.x())
      .attr('cy', line.y())
      .attr('r', r)
      .on('mouseover', function(d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr('r', r_max)
        d3.select('.tips')
          .style('display', 'block')
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr('r', r)
        d3.select('.tips')
          .style('display', 'none')
      })
      .append('title')
      .text(function(d) {
        return '日期：' + d3.time.format('%Y-%m-%d')(d.date) + ' PV：' + d.pv
      })
  })
}

const kickstarterURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';
const moviesURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';
const gamesURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';

Promise.all([fetch(kickstarterURL), fetch(moviesURL), fetch(gamesURL)])
  .then(responses => Promise.all(responses.map(response => response.json())))
  .then((data) => {
    const kickstarterData = data[0];
    const moviesData = data[1];
    const gamesData = data[2];
    const buttons = document.querySelectorAll('button');
    const headerData = {
      kickstarter: {
        title: 'Kickstarter Pledges',
        info:'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category'
      },
      movies: {
        title: 'Movie Sales',
        info: 'Top 100 Highest Grossing Movies Grouped By Genre'
      },
      games: {
        title: 'Video Game Sales',
        info: 'Top 100 Most Sold Video Games Grouped by Platform'
      }
    };
  
    treeMap(moviesData);  
  
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const id = button.getAttribute('id');
        const treemapContainer = document.querySelector('.treemap-container');
        const legendContainer = document.querySelector('.legend-container');
        treemapContainer.innerHTML = null;
        legendContainer.innerHTML = null;

        if (id === 'movies') {
          document.getElementById('title').innerHTML = headerData.movies.title;
          document.getElementById('description').innerHTML = headerData.movies.info;
          treeMap(moviesData);
        } else if (id === 'games'){
          document.getElementById('title').innerHTML = headerData.games.title;
          document.getElementById('description').innerHTML = headerData.games.info;
          treeMap(gamesData);
        } else {
          document.getElementById('title').innerHTML = headerData.kickstarter.title;
          document.getElementById('description').innerHTML = headerData.kickstarter.info;
          treeMap(kickstarterData);
        }
      })
    })
 });

const treeMap = (dataset) => {
  const width = 1050;
  const height = 650;
  const padding = 40;
  const colors = ['#4F98CA', '#FF5656', '#C7FFD8', '#FFEA85', '#98B4A6', '#CDDEFF', '#FFC0D3', '#005691', '#E08E6D', '#F2EAD3', '#FFBC97', '#EA8A8A', '#F4D19B', '#986EAD', '#EBD5D5', '#ACDCEE', '#A80038', '#EEEEEE', '#CAE4DB', '#6D9886'];
  
  //generate scale for colors
  const colorScale = d3
    .scaleOrdinal()
    .domain(dataset.children.map((d) => d.name))
    .range(colors)

  //generate svg
  const svg = d3
     .select('.treemap-container')
     .append('svg')
     .attr('width', width)
     .attr('height', height)
  
  //generate tooltip
  const tooltip = d3
     .select('.treemap-container')
     .append('div')
     .attr('id', 'tooltip')
     .style('opacity', 0)
  
  //generate treemap
  const root = d3
    .hierarchy(dataset, (d) => d.children)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value)
  
  const generateTreeMap = d3.treemap().size([width, height]).paddingInner(1.2);
  generateTreeMap(root);
  
  const cell = svg
    .selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`)
    .on('mouseover', (event, d) => {
      tooltip.transition()
             .duration(100)
             .style('opacity', 0.9);
      tooltip.style('left', event.pageX + 20 + 'px')
             .style('top', event.pageY - 20 + 'px')
             .attr('data-value', d.data.value);
      tooltip.html('Name: ' + d.data.name + '<br>' + 'Category: ' + d.data.category + '<br>' + 'Value: ' + d.data.value);
     })
    .on('mouseout', () => {
      tooltip.transition()
             .duration(100)
             .style('opacity', 0);
     })
  
  cell
    .append('rect')
    .attr('class', 'tile')
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('fill', (d) => colorScale(d.data.category))  
  
  cell
      .append('text')
      .selectAll('tspan')
      .data((d) => d.data.name.split(' '))
      .enter()
      .append('tspan')
      .attr('font-size', '13')
      .attr('x', 10)
      .attr('dy', (d, i) => 12 + i * 2)
      .text((d) => d);
  
  //generate legend
  const legendHeight = 25;
  const categoriesData = root.leaves().map((d) => d.data.category);
  const categories = categoriesData.filter((item, i) => categoriesData.indexOf(item) === i);
  
  const legend = d3
    .select('.legend-container')
    .append('svg')
    .attr('id', 'legend')
    .attr('width', 145)
    .attr('height', 450)

  const legendElements = legend
    .selectAll('g')
    .data(categories)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(0, ${i * legendHeight})`)
  
  legendElements
    .append('text')
    .attr('class', 'legend-text')
    .attr('x', legendHeight)
    .attr('y', 12)
    .text((d) => d);

  legendElements
    .append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('class', 'legend-item')
    .attr('fill', (d) => colorScale(d))
}
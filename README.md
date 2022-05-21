# biowc-heatmap

An interactive, zoomable heatmap with rich annotations and selectable dendrograms for exploring biological datasets.

## Installation

```bash
npm i biowc-heatmap
```

## Usage

The component is built using [lit-element](https://lit.dev/).
It is a [webcomponent](https://www.webcomponents.org/) so you can use it with any framework or library like
[Vue](https://vuejs.org/guide/extras/web-components.html#using-custom-elements-in-vue)
or [React](https://reactjs.org/docs/web-components.html)
or just in vanilla js:

```html
<biowc-heatmap id="heatmap"></biowc-heatmap>
<biowc-heatmap-legend id="legend"></biowc-heatmap-legend>

<script type="module">
  import '../dist/src/biowc-heatmap.js';
  import '../dist/src/biowc-heatmap-legend.js';

  const biowcHeatmap = document.querySelector('#heatmap');

  // Set the color of the heatmap cells
  biowcHeatmap.cellColor = '#ff0000';

  // Sets the color scale which will be used to color the heatmap cells.
  // `.color` will be ignored if `.colorScale` is set
  biowcHeatmap.cellColorScale = {
    colors: ['#0000bb', '#ffffff', '#ff0000'],
    values: [-2, 0, 1]
  };
  // `biowcHeatmap.color = '#ff0000';` is equivalent to:
  // `biowcHeatmap.colorScale = { colors: ['#ffffff', '#ff0000'], values: [0, 1] };`
  // values which are outside the range of `values` will be correspondingly colored
  // with the color for the lowest or highest value in `colors`.


  // Sets the data values which the cells will be colored based on.
  biowcHeatmap.data = [
    [-3, 0.6, -1],
    [0.1, 0.0, -0.7],
    [-0.5, 0.7, 2.0],
  ];

  // Sets the labels on the sides
  biowcHeatmap.labels = {
    top: ['T1', 'T2', 'T3'],
    left: ['L1', 'L2', 'L3'],
    right: ['R1', 'R2', 'R3'],
    bottom: ['B1', 'B2', 'B3'],
  };

  // Sets the axis labels
  biowcHeatmap.axisLabels = {
    top: 'Top',
    left: 'Left',
    right: 'Right',
    bottom: 'Bottom',
  };

  // Set the colors for the color annotation bar
  biowcHeatmap.colorAnnots =  {
    top: ['#1f77b4', '#1f77b4', '#ff7f0e'],
    left: ['#1f77b4', '#1f77b4', '#ff7f0e'],
    right: ['#1f77b4', '#1f77b4', '#ff7f0e'],
    bottom: ['#1f77b4', '#1f77b4', '#ff7f0e'],
  };

  // Set labels for the colors in the color annotation bar
  biowcHeatmap.colorAnnotLabels =  {
    top: {
      '#1f77b4': 'A',
      '#ff7f0e': 'B',
    },
    left: {
      '#1f77b4': 'C',
      '#ff7f0e': 'D',
    },
    right: {
      '#1f77b4': 'E',
      '#ff7f0e': 'F',
    },
    bottom: {
      '#1f77b4': 'H',
      '#ff7f0e': 'I',
    }
  }

  // Pass dendrograms as tree structure
  const dendrogramTree = {
    left: {
      left: 0,
      right: 1,
      height: 1,
    },
    right: 2,
    height: 2,
  };

  // Or as a self referencing array which is more performant and required for large datasets
  const dendrogramArray = [
    {
      left: 0,
      isLeftDendrogram: false,
      right: 1,
      isRightDendrogram: false,
      height: 1,
    },
    {
      left: 0,
      isLeftDendrogram: true,
      right: 2,
      isRightDendrogram: false,
      height: 2,
    }
  ];

  // Sets the dendrograms for the sides
  biowcHeatmap.dendrograms = {
    top: dendrogramTree,
    left: dendrogramArray,
    right: dendrogramTree,
    bottom: dendrogramArray,
  };

  // Set the `forHeatmap` property of the legend to the heatmap just created
  // The legend will then be created according to the properties set on the heatmap
  const biowcHeatmapLegend = document.querySelector('#legend');
  biowcHeatmapLegend.forHeatmap = biowcHeatmap;

  // Set the title for the color scale in the legend
  biowcHeatmapLegend.colorScaleTitle = 'Unit description'
</script>
```

## Contributing

If you found a bug or think an important feature is missing, please open an issue. PRs are also welcome. There are no guidelines yet for contribution.

## License

This project is licensed under the [MIT license](LICENSE).

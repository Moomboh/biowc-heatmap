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

<script type="module">
  import '../dist/src/biowc-heatmap.js';

  const biowcHeatmap = document.querySelector('#heatmap');

  // Sets the color scale which will be used to color the heatmap cells.
  biowcHeatmap.color = {
    colors: ['#0000bb', '#ffffff', '#ff0000'],
    values: [-1, 0, 1]
  };
  // can also be set to a single color: `biowcHeatmap.color = '#ff0000';`
  // which is equivalent to:
  // `biowcHeatmap.color = { colors: ['#ffffff', '#ff0000'], values: [0, 1] };`

  // Sets the data values which the cells will be colored based on (must be between 0 and 1).
  biowcHeatmap.data = [
    [0.2, 0.6, 0.3],
    [0.1, 0.2, 0.7],
    [0.5, 0.4, 1.0],
  ];

  // Sets the labels on the sides
  biowcHeatmap.labels = {
    top: ['T1', 'T2', 'T3'],
    left: ['L1', 'L2', 'L3'],
    right: ['R1', 'R2', 'R3'],
    bottom: ['B1', 'B2', 'B3'],
  };

  biowcHeatmap.colorAnnots =  {
    top: ['red', 'green', 'blue'],
    left: ['red', 'green', 'blue'],
    right: ['red', 'green', 'blue'],
    bottom: ['red', 'green', 'blue'],
  };

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
</script>

<style>
  /* you might want to set sizes of the sides and annotation elements explicitly.
    * this can be done via the following CSS variables, which accept any valid CSS unit:
  */
  #heatmap {
    --biowc-heatmap-top-size: 200px;
    --biowc-heatmap-dendrogram-top-size: 100px;
    --biowc-heatmap-label-top-size: 60px;
    --biowc-heatmap-color-annot-top-size: 40px;
    /* analogous CSS variables exist for left, right and bottom */
  }
</style>
```

## Contributing

If you found a bug or think an important feature is missing, please open an issue. PRs are also welcome. There are no guidelines yet for contribution.

## License

This project is licensed under the [MIT license](LICENSE).

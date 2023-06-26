# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.1](https://github.com/Moomboh/biowc-heatmap/compare/v0.5.0...v0.5.1) (2023-06-26)


### Features

* do not render null values ([a5fafce](https://github.com/Moomboh/biowc-heatmap/commits/a5fafce33ceca6420c42d493c37e1073871b0a04))

## [0.5.0](https://github.com/Moomboh/biowc-heatmap/compare/v0.4.0...v0.5.0) (2022-08-30)


### ⚠ BREAKING CHANGES

* remove yShift property

### Features

* add min-height-fraction prop for dendrogra ([9de5df3](https://github.com/Moomboh/biowc-heatmap/commits/9de5df3f4801c6c30b7bb97020c0fb5b0bf19e19))
* add SVG export ([b4eab9d](https://github.com/Moomboh/biowc-heatmap/commits/b4eab9d8a55b3de91b6454300ff8bb06969faaa4))
* zoom into cursor position ([c046e01](https://github.com/Moomboh/biowc-heatmap/commits/c046e012e1aa250d91b4dbb9ec8fe7a033ce6da7))

## [0.4.0](https://github.com/Moomboh/biowc-heatmap/compare/v0.3.0...v0.4.0) (2022-05-24)

This release is centered around improving rendering performance.

### ⚠ BREAKING CHANGES

* Tooltip is removed for performance reasons - might be added back in later version.
  The zoom buffering is also removed and zooming is now applied instantaniously.

### Features

* remove tooltip for perf reasons ([8c496b9](https://github.com/Moomboh/biowc-heatmap/commits/8c496b9a14632b35cffd86e2863e863f6c1769b1))
* show full label as title ([4bd835f](https://github.com/Moomboh/biowc-heatmap/commits/4bd835f377e2752aafd557c082b07bcc013dd938))


### Bug Fixes

* fix dendrogram cut off at border ([c55ba92](https://github.com/Moomboh/biowc-heatmap/commits/c55ba9237ca35f238078b237428dd44e9d1cb81c))

## [0.3.0](https://github.com/Moomboh/biowc-heatmap/compare/v0.2.1...v0.3.0) (2022-05-21)


### Features

* legend: title for color scale and restyle ([273c860](https://github.com/Moomboh/biowc-heatmap/commits/273c8604bd91f435ee0b8666ecab99cdc634ec55))

### [0.2.1](https://github.com/Moomboh/biowc-heatmap/compare/v0.2.0...v0.2.1) (2022-05-21)


### Bug Fixes

* add missing export for `BiowcHeatmapLegend` ([f5ece69](https://github.com/Moomboh/biowc-heatmap/commits/f5ece6995e0191e85c391c51f8f5db701369e494))

## [0.2.0](https://github.com/Moomboh/biowc-heatmap/compare/v0.1.0...v0.2.0) (2022-05-20)


### Features

* add legend component ([4f6b062](https://github.com/Moomboh/biowc-heatmap/commits/4f6b0627c7c9c1cab4f76aa358854290c3a60681))
* add option to pass a `ColorScaleConfig` ([e086712](https://github.com/Moomboh/biowc-heatmap/commits/e0867121fd9ebb8f1495f0c7ca9b511b71ee26d6))
* add property for axis labels ([9416efa](https://github.com/Moomboh/biowc-heatmap/commits/9416efaa3b67957ed3ca8176f3feec4930ffbae9))
* labels on hover for color annotation ([dd802c3](https://github.com/Moomboh/biowc-heatmap/commits/dd802c3ec6a9949776c1bba9ca465790bfd83742))
* make color annots hoverable and selectable ([7cdf4cb](https://github.com/Moomboh/biowc-heatmap/commits/7cdf4cbea5fa5c603e2892e10fd06d979aa06f53))


### Bug Fixes

* css syntax error ([a1e0c23](https://github.com/Moomboh/biowc-heatmap/commits/a1e0c2386c63620679456c36eeb39a920998e16b))

## 0.1.0 (2022-05-13)

Initial release. 🎉

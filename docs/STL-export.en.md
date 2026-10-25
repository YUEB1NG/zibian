# STL export

[简体中文](STL导出.md) · [English README](../README.en.md)

Choose Export STL above the price. Edited text is generated first; invalid input or failed generation never downloads the previous model. Preview and download use the same binary mesh buffer.

Files are named `zibian_LOVE_HOME.stl`. `&` becomes `AND` and `/` becomes `SLASH` for filesystem compatibility.

Coordinates use millimetres and the bottom of the platform is Z=0. STL carries no unit metadata, so import as millimetres. Viewport scaling and rotation do not change dimensions. The complete rectangular base is preserved.

The Arimo LOVE / HOME example measures approximately 140.33 × 142.86 × 32.80 mm. Glyphs overlap the platform by 0.2 mm for a physical connection. Earlier Tahoma models have different geometry.

STL has no material or printer settings. Inspect the model in your slicer, including disconnected strokes, orientation and supports. Automated desktop and mobile-viewport download checks are documented in stl-export-checks.json; physical printing and real iOS/Android file saving have not been verified.

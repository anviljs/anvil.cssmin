## Anvil Cssmin Plugin

This plugin requires anvil.js version 0.8.* or greater.

## Installation

	anvil install anvil.cssmin

## Usage

If this plugin is installed and enabled, it can minify .css files using the cssmin node library.

### Minifying All The Things
Add the following snippet to the build.json:

	"anvil.cssmin": {
		"all": "true"
	}

### Inclusive Minification
Add the following snippet to the build.json to compile **only** the listed files:

	"anvil.cssmin": {
		"include": [
			"./path/to/file1",
			"./path/to/file2",
			"./path/to/file4",
		]
	}

### Exclusive Minification
Add the following snippet to the build.json to compile everything but the listed files:

	"anvil.cssmin": {
		"exclude": [
			"./path/to/file1",
			"./path/to/file2",
			"./path/to/file4",
		]
	}

Note: you can also use minimatch style blobs to match multiple files for inclusion or exclusion. For example, the blob to match all files under a specific folder's tree would be: "/folderToMinify/**/*.css"
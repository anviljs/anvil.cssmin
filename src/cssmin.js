var cssmin,
	path = require( "path" );

module.exports = function( _, anvil ) {
	anvil.plugin( {
		name: "anvil.cssmin",
		activity: "post-process",
		all: false,
		inclusive: false,
		exclusive: false,
		fileList: [],
		commander: [
			[ "--cssmin", "minify all css" ]
		],

		configure: function( config, command, done ) {
			if( this.config ) {
				if( this.config.all ) {
					this.all = true;
				} else if ( this.config.include ) {
					this.inclusive = true;
					this.fileList = this.config.include;
				} else if ( this.config.exclude ) {
					this.exclusive = true;
					this.fileList = this.config.exclude;
				}
			}
			if( command.cssmin ) {
				this.all = true;
			}
			done();
		},

		run: function( done ) {
			if( !this.all && !this.exclusive && !this.inclusive ) {
				done();
				return;
			}
			if( !cssmin ) {
				cssmin = require( "cssmin" ).cssmin;
			}
			var self = this,
				getRegex = function( sep ) { return anvil.utility.parseRegex( "/[\\" + sep + "]/g" ); },
				osSep = path.sep,
				altSep = osSep === "/" ? "\\" : "/",
				osSepRegex = getRegex( osSep ),
				altSepRegex = getRegex( altSep ),
				useAlternate = false,
				cssFiles = _.filter( anvil.project.files, function( file ) {
					return file.extension() === ".css" && !file.noCopy;
				} ),
				specs = _.map( self.fileList, function( spec ) {
					if( spec.indexOf( altSep ) >= 0 ) {
						useAlternate = true;
					}
					return spec;
				} ),
				any = function( file ) {
					return _.any( specs, function( spec ) {
						return file === spec ||
								anvil.fs.match( [ file ], spec.replace( /^.[\/]/, "/" ), {} ).length > 0;
					} );
				},
				getPath = function( file ) {
					var relative = anvil.fs.buildPath( [ file.relativePath, file.name ] );
					if( useAlternate ) {
						relative = relative.replace( osSepRegex, altSep );
					}
					return relative;
				},
				exclude = function() {
					return _.reject( cssFiles, function( file ) {
						return any( getPath( file ) );
					} );
				},
				include = function() {
					return _.filter( cssFiles, function( file ) {
						return any( getPath( file ) );
					} );
				};

			if ( this.inclusive ) {
				cssFiles = include();
			} else if( this.exclusive ) {
				cssFiles = exclude();
			}
			if( cssFiles.length > 0 ) {
				anvil.log.step( "CSS Minifying " + cssFiles.length + " files" );
				anvil.scheduler.parallel( cssFiles, this.minify, function() { done(); } );
			} else {
				done();
			}
		},

		minify: function( file, done ) {
			var self = this;
			anvil.fs.read( [ file.workingPath, file.name ], function( content, err ) {
				if( !err ) {
					var final = cssmin( content ),
						newName = self.rename( file.name );

					anvil.fs.write( [file.workingPath, newName ], final, function( err ) {
						if( err ) {
							anvil.log.error( "Error writing " + file.fullPath + " for css minification: \n" + err.stack );
						} else {
							var minified = _.clone( file );
							minified.name = newName;
							anvil.project.files.push( minified );
						}
						done();
					} );
				} else {
					anvil.log.error( "Error reading " + file.fullPath + " for css minification: \n" + err.stack  );
					done();
				}
			} );
		},

		rename: function( name ) {
			return name.replace( ".css", ".min.css" );
		}
	} );
};
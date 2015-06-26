"use strict";

var _ = require("underscore");
var fs = require("fs");
var path = require("path");

var MultiString = require("./multi-string.js");
var SmartString = require("./smart-string.js");
var ConfigData = require("./config-data.js");

var deepMerge = require("./deep-merge.js");

/**
 * Configle config system
 * @module configle
 */

/**
 * Wraps a configuration. Only use this if you plan to build the configuration
 * programmatically. To load config files you should use Configle.load.
 *
 * @class
 * @see Configle#load
 */
function Configle() {
  this.pendingOptions = [];
  this.pendingConfig = [];
  this.options.apply(this, _.toArray(arguments));
}

var loaders = {
  json: JSON.parse
};


Configle.defaultOptions = function() {
  return {
    startDir: ".",
    expandVars: true,
    expandEnv: true,
    allowUndefined: false,
    resolvers: [],
    defaultResolvers: [],
    loaders: {
      json: JSON.parse
    }
  };
};

/**
 * Load config files from directories at and above the current directory to build
 * a merged config.
 *
 * @param {string} [baseName]
 *          - The base name for the config file. Processed as a {@link MultiString}
 *            so patterns such as "config.(local|)" are allowed.
 *
 * @param {Object} [options]
 *          - Configuration options.
 *
 * @param {String} [options.baseName]
 *          - The base name may be included as an option or a parameter.
 *
 * @param {String} [options.startDir]
 *          - The directory to start searching from. Defaults to "."
 *
 * @param {Number} [options.maxUp]
 *          - The maximum number of directories levels to go up.
 *            Defaults to unlimited
 *
 * @param {Number} [options.stopAfter]
 *          - Stop after this number of directory levels have yielded matching
 *            config files. Defaults to unlinited.
 *
 * @param {Boolean} [options.expandVars]
 *          - Perform variable expansion on the loaded config. Defaults to
 *            <tt>true</tt>.
 *
 * @param {Boolean} [options.allowUndefined]
 *          - Allow undefined variables during variable expansion. Defaults to
 *            <tt>false</tt>
 *
 * @param {Boolean} [options.expandEnv]
 *          - Perform environment variable expansion on the loaded config.
 *            Defaults to <tt>true</tr>.
 *
 * @returns {Configle}
 *          - A Configle object
 */

Configle.load = function() {
  var figle = new Configle();
  return figle.load.apply(figle, _.toArray(arguments));
};

Configle.prototype = {

  options: function() {
    if (this.myOptions !== undefined) {
      throw new Error("Can't call options() after getOptions() or load()");
    }
    for (var i = 0; i < arguments.length; i++) {
      this.pendingOptions.unshift(arguments[i]);
    }
    return this;
  },

  getOptions: function() {
    if (this.myOptions === undefined) {
      var pending = this.pendingOptions;
      pending.push(Configle.defaultOptions());
      this.myOptions = deepMerge.array(pending);
    }
    return this.myOptions;
  },

  addConfig: function(config, fromDir) {
    if (this.config !== undefined) {
      throw new Error("Can't add config after get() or load()");
    }
    if (fromDir !== undefined) {
      config = SmartString.smarten(config, fromDir);
    }
    this.pendingConfig.push(config);
    return this;
  },

  loadFile: function(name, loader) {
    var dir = path.dirname(name);
    var data = fs.readFileSync(name);

    if (loader === undefined || !_.isFunction(loader)) {
      var opt = this.getOptions();
      if (loader === undefined) {
        var ext = path.extname(name);
        if (ext.length > 1) {
          loader = ext.substr(1);
        }
      }
      if (loader !== undefined) {
        loader = opt.loaders[loader];
      }
      if (loader === undefined) {
        throw new Error("Can't find loader for " + name);
      }
    }

    return this.addConfig(loader(data), dir);
  },

  load: function() {
    if (arguments.length) {
      var args = _.toArray(arguments);
      if (_.isString(args[0])) {
        args[0] = {
          baseName: args[0]
        };
      }
      this.options.apply(this, args);
    }

    var opt = this.getOptions();

    if (!opt.hasOwnProperty("baseName")) {
      throw new Error("Required option baseName is missing");
    }

    var numFound = 0;
    var namer = new MultiString(opt.baseName);
    var dir = fs.realpathSync(opt.startDir);
    var loaderNames = _.keys(loaders)
      .sort();

    for (var up = 0; /*lint*/ ; up++) {
      var found = false;
      if ((opt.hasOwnProperty("maxUp") && up >= opt.maxUp) ||
        (opt.hasOwnProperty("stopAfter") && numFound >= opt.stopAfter)) {
        break;
      }

      namer.each(function(name) {
        loaderNames.forEach(function(ext) {
          var loader = loaders[ext];
          var confName = ext.length ? name + "." + ext : name;
          var confFile = path.join(dir, confName);
          try {
            this.loadFile(confFile, loader);
            found = true;
          } catch (e) {
            if (e instanceof Error && e.code === "ENOENT") {
              return;
            }
            throw e;
          }
        }, this);
      }, this);

      if (found) {
        numFound++;
      }

      var nextDir = path.dirname(dir);
      if (nextDir === dir) {
        break;
      }
      dir = nextDir;
    }

    return this.get();
  },

  resolveConfig: function() {
    if (this.config === undefined) {
      var opt = this.getOptions();
      var config = deepMerge.array(this.pendingConfig);
      if (opt.expandVars || opt.expandEnv) {
        config = ConfigData.expandVars(config, opt);
      }
      this.config = SmartString.toStrings(config);
      this.pathConfig = SmartString.toPathnames(config);
    }
    return this;
  },

  get: function() {
    this.resolveConfig();
    if (arguments.length === 0) {
      return this.config;
    }
    return ConfigData.get(this.config, arguments[0]);
  },

  getPathname: function() {
    this.resolveConfig();
    if (arguments.length === 0) {
      return this.pathConfig;
    }
    return ConfigData.get(this.pathConfig, arguments[0]);
  }

};

module.exports = Configle;

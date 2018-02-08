const alias           = require("rollup-plugin-alias"),
      resolve         = require("rollup-plugin-node-resolve"),
      sourcemaps      = require("rollup-plugin-sourcemaps"),
      uglify          = require("rollup-plugin-uglify"),
      dateFormat      = require("dateformat"),
      license         = require("fs").readFileSync("./LICENSE", "utf8"),
      rxjsPathMapping = require("rxjs/_esm5/path-mapping")();


const utils = {

    hasMinifyFlag: argv => {
        return !!argv.includes("--minify");
    },

    getTarget: argv => {
        return argv[argv.indexOf("--target") + 1];
    },

    getBanner: packageJson => {
        return `/*!\n${packageJson.name} ${packageJson.version} ${dateFormat(Date.now(), "UTC:yyyy-mm-dd HH:MM")} UTC\n${license}\n*/`;
    },

    getRollupInputPath: (packageJson, target) => {

        let moduleName = packageJson.name.split("/").pop();

        return `./dist/${target}/${moduleName}/${moduleName}.js`;
    },

    getRollupOutputPath: (packageJson, format, target, minify) => {

        let moduleName      = packageJson.name.split("/").pop(),
            bundleFolder    = format === "umd" ? "bundles" : `${target.slice(0, 2)}m${target.slice(2)}`,
            formatExtension = format === "umd" ? ".umd" : "",
            fileExtension   = minify ? "min." : "";

        return `./dist/${packageJson.name}/${bundleFolder}/${moduleName}${formatExtension}.${fileExtension}js`;
    },

    getRollupPlugins: minify => {

        const plugins = [alias(rxjsPathMapping), resolve({
            jsnext: true,
        }), sourcemaps()];

        if (minify) {
            plugins.push(uglify({output: {comments: (node, comment) => comment.value.startsWith("!")}}));
        }

        return plugins;
    },

    getRollupFormat: argv => {
        return argv[argv.indexOf("-f") + 1];
    },

    getRollupGlobals: () => {

        return {
            "@angular/animations": "ng.animations",
            "@angular/common": "ng.common",
            "@angular/core": "ng.core",
            "@angular/http": "ng.http",
            "@angular/forms": "ng.forms",
            "@angular/material": "ng.material",
            "@angular/platform-browser": "ng.platformBrowser",
            "@angular/platform-browser-dynamic": "ng.platformBrowserDynamic",
            "@angular/router": "ng.router",
            "@ng-dynamic-forms/core": "ngDF.core",
            "@ng-dynamic-forms/ui-material": "ngDF.material",
            "angular2-text-mask": "angular2-text-mask",
            "rxjs/BehaviorSubject": "Rx.BehaviorSubject",
            "rxjs/Observable": "Rx.Observable",
            "rxjs/Subject": "Rx.Subject",
            "rxjs/Subscription": "Rx.Subscription",
            "rxjs/add/observable/of": "rxjs/add/observable/of",
            "rxjs/add/operator/map": "rxjs/add/operator/map",
            "rxjs/operator/map": "rxjs/operator/map",
            "rxjs/operator/distinctUntilChanged": "rxjs/operator/distinctUntilChanged",
            "rxjs/operator/observeOn": "rxjs/operator/observeOn",
            "rxjs/operator/scan": "rxjs/operator/scan",
            "rxjs/scheduler/queue": "rxjs/scheduler/queue"
        };
    },

    getRollupConfig(packageJson, name) {

        const format  = utils.getRollupFormat(process.argv),
              globals = utils.getRollupGlobals(),
              target  = utils.getTarget(process.argv),
              minify  = utils.hasMinifyFlag(process.argv);

        return {

            input: utils.getRollupInputPath(packageJson, target),
            output: {
                file: utils.getRollupOutputPath(packageJson, format, target, minify),
                format: format,
                name: name,
                globals: globals,
                sourcemap: true,
                exports: "named",
                banner: utils.getBanner(packageJson)
            },
            context: "this",
            external: Object.keys(globals),
            plugins: utils.getRollupPlugins(minify),
        };
    }
};

module.exports = utils;

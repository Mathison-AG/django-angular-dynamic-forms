import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import alias from "rollup-plugin-alias";
import uglify from "rollup-plugin-uglify";

const rxjsPathMapping = require("rxjs/_esm5/path-mapping")();
const path = require('path');

const globals = {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    "angular2-text-mask": "angular2-text-mask",
};

const target = process.argv[process.argv.indexOf("--target") + 1];
const minify = !!process.argv.includes("--minify");
const format = process.argv[process.argv.indexOf("-f") + 1];


let moduleName      = 'django-angular-dynamic-forms',
    bundleFolder    = format === "umd" ? "bundles" : `${target.slice(0, 2)}m${target.slice(2)}`,
    formatExtension = format === "umd" ? ".umd" : "",
    fileExtension   = minify ? "min." : "";

const outputFilesDir = path.resolve(`./dist/${target}/${moduleName}`);
const outputPath = `./dist/@mesemus/${moduleName}/${bundleFolder}/${moduleName}${formatExtension}.${fileExtension}js`;

const plugins = [
        alias(rxjsPathMapping),
        resolve(),
        sourcemaps()
    ]

if (minify) {
    plugins.push(uglify({output: {comments: (node, comment) => comment.value.startsWith("!")}}));
}

export default {
    plugins: plugins,
    onwarn: () => { return },
    input: `./dist/${target}/django-angular-dynamic-forms/django-angular-dynamic-forms.js`,
    output: {
        file: outputPath,
        format: 'umd',
        name: 'mesemus.djangoAngularDynamicForms',
        globals: globals,
        sourcemap: true,
        exports: 'named',
        amd: { id: 'django-angular-dynamic-forms' },
    },
    external: x => {
        const ext = !x.startsWith('./') && !x.startsWith(outputFilesDir);
        console.log('external?', x, ext);
        return ext;
    }
}

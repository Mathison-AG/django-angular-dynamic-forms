import * as webpack from 'webpack';
import * as path from 'path';
import * as fs from 'fs';
import * as angularExternals from 'webpack-angular-externals';
import * as rxjsExternals from 'webpack-rxjs-externals';


function ngDynamicFormsExternals(context, request, callback) {
    console.log(request);
    if (request.startsWith('@ng-dynamic-forms/')) {
        return callback(null, {
            root: request,
            commonjs: request,
            commonjs2: request,
            amd: request
        });
    }

    callback();

};

const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

export default {
    entry: {
        'index.umd': './lib-dist/django-angular-dynamic-forms.js',
        'index.umd.min': './lib-dist/django-angular-dynamic-forms.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'django-angular-dynamic-forms'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    externals: [
        angularExternals(),
        rxjsExternals(),
        ngDynamicFormsExternals
    ],
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: 'tsconfig.json'
                        }
                    },
                    {
                        loader: 'angular2-template-loader'
                    }
                ],
                exclude: [
                    /node_modules/,
                    /\.(spec|e2e)\.ts$/
                ]
            },

            {
                test: /\.json$/,
                use: 'json-loader'
            },

            {
                test: /\.css$/,
                use: ['to-string-loader', 'css-loader']
            },

            {
                test: /\.scss$/,
                use: ['to-string-loader', 'css-loader', 'sass-loader']
            },

            {
                test: /\.html$/,
                use: 'raw-loader'
            }
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            path.join(__dirname, 'src')
        ),

        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            sourceMap: true
        }),

        new webpack.BannerPlugin({
            banner: `
/**
 * ${pkg.name} - ${pkg.description}
 * @version v${pkg.version}
 * @author ${pkg.author.name}
 * @link ${pkg.homepage}
 * @license ${pkg.license}
 */
      `.trim(),
            raw: true,
            entryOnly: true
        })

    ]
} as webpack.Configuration;

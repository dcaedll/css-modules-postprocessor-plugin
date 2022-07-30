const path = require('path');
const webpack = require('webpack');
const posthtml = require('posthtml');
const posthtmlCssModules = require('posthtml-css-modules');

exports.CssModulesPostprocessorPlugin = class CssModulesPostprocessorPlugin
{
    constructor(cssModulesProvider = () => global.cssModules)
    {
        this.cssModulesProvider = cssModulesProvider;
    }

    apply(compiler)
    {
        compiler.hooks.thisCompilation.tap('CssModulesPostprocessor', compilation => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'CssModulesPostprocessor',
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
                },
                assets => {
                    let cssModules;
                    if (typeof this.cssModulesProvider === 'function')
                        cssModules = this.cssModulesProvider();
                    else return;

                    Object.entries(assets)
                        .filter(([pathname]) => path.parse(pathname).ext === '.html')
                        .forEach(([pathname, source]) => {
                            const res = posthtml([posthtmlCssModules(cssModules)])
                                .process(source.source(), { sync: true });
                            compilation.updateAsset(pathname, new webpack.sources.RawSource(res.html));
                        });
                }
            );
        });
    }
}
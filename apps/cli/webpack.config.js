const path = require("path")
const nodeExternals = require("webpack-node-externals")
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin")

// Base package.json để làm cơ sở
const basePackage = {
    name: "cli-node",
    version: "1.0.0",
    main: "./main.js",
    bin: {
        "cifarm": "node ./main.js"
    },
    scripts: {
        "start": "node ./main.js"
    },
    engines: {
        node: ">= 14",
    },
    dependencies: {
    }
}

module.exports = {
    entry: "./apps/cli/src/main.ts",
    output: {
        path: path.join(__dirname, "../..", "dist", "apps", "cli"),
        filename: "main.js",
    },
    target: "node",
    externals: [nodeExternals()],
    plugins: [
        new GeneratePackageJsonPlugin(basePackage, {
            debug: true,
            resolveContextPaths: [__dirname],
            useInstalledVersions: true,
            excludeDependencies: [          
                // "near-api-js",
                // "near-seed-phrase",
                // "nestjs-grpc-exceptions",
                // "passport-jwt",
                // "rxjs",
                // "socket.io-client",
            ],
        }),
    ],
}

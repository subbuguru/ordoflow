const fs = require('fs');
const glob = require('glob');
const babel = require('@babel/core');

const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**', 'build/**']
});

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const result = babel.transformSync(code, {
    filename: file,
    parserOpts: { plugins: ['typescript', 'jsx'] },
    generatorOpts: { comments: false },
    configFile: false, // Don't use any config, disables all plugins/presets
    babelrc: false,
    ast: false,
    code: true,
  });
  fs.writeFileSync(file, result.code, 'utf8');
  console.log(`Stripped comments from: ${file}`);
});

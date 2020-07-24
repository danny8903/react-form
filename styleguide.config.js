const path = require('path');
const fs = require('fs');

module.exports = {
  title: 'React Form Example',
  sections: [
    {
      name: 'Sign Up Form',
      content: 'examples/SignUpForm.md',
    },
  ],
  components: 'examples/**/*.{js,jsx}',
  compilerConfig: {
    transforms: { moduleImport: false },
  },
  skipComponentsWithoutExample: true,
  moduleAliases: {
    '@danny-qu/form': path.resolve(__dirname, 'src'),
  },
  updateExample(props, exampleFilePath) {
    const { settings, lang } = props;
    if (settings && typeof settings.file === 'string') {
      const filepath = path.resolve(
        path.dirname(exampleFilePath),
        settings.file
      );
      settings.static = true;
      delete settings.file;

      return {
        content: fs.readFileSync(filepath, 'utf8'),
        settings,
        lang,
      };
    }
    return props;
  },
  webpackConfig: {
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  noEmit: false,
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader',
        },
      ],
    },
  },
};

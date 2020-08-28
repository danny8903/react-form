const path = require('path');
const fs = require('fs');

module.exports = {
  title: 'React Form Docs',
  pagePerSection: true,
  sections: [
    {
      name: 'Introduction',
      content: 'examples/Introduction.md',
    },
    {
      name: 'SignUpForm',
      content: 'examples/SignUpForm.md',
    },
    {
      name: 'FormValuesExample',
      content: 'examples/FormValuesExample.md',
    },
  ],
  ribbon: {
    url: 'https://github.com/danny8903/react-form',
    text: 'Fork me on GitHub',
  },
  components: 'examples/**/*.{js,jsx}',
  compilerConfig: {
    transforms: { moduleImport: false },
  },
  styleguideComponents: {
    StyleGuideRenderer: path.join(
      __dirname,
      'styleguide/components/StyleGuide'
    ),
    SectionRenderer: path.join(
      __dirname,
      'styleguide/components/SectionRenderer'
    ),
  },
  styles: function (theme) {
    return {
      TableCell: {
        td: {
          // we can now change the color used in the logo item to use the theme's `link` color
          borderBottom: '1px solid rgb(232, 232, 232)',
          padding: '16px 32px 16px 0',
        },
      },
    };
  },
  skipComponentsWithoutExample: true,
  moduleAliases: {
    '@danny-ui/react-form': path.resolve(__dirname, 'src'),
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
  require: [path.resolve(__dirname, 'styleguideSetup.js')],
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

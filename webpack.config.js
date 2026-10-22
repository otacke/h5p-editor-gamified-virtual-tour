import { dirname, resolve as _resolve, join } from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mode = process.argv.includes('--mode=production') ?
  'production' :
  'development';
const libraryName = process.env.npm_package_name;

export default {
  mode: mode,
  resolve: {
    alias: {
      '@assets': _resolve(__dirname, 'src/assets'),
      '@components': _resolve(__dirname, 'src/components'),
      '@context': _resolve(__dirname, 'src/context'),
      '@h5phelpers': _resolve(__dirname, 'src/h5phelpers'),
      '@root': _resolve(__dirname, './'),
      '@src': _resolve(__dirname, 'src'),
      '@styles': _resolve(__dirname, 'src/styles'),
      '@types': _resolve(__dirname, 'src/types'),
    },
  },
  optimization: {
    minimize: mode === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `${libraryName}.css`,
    }),
  ],
  entry: {
    dist: './src/app.js',
  },
  output: {
    filename: `${libraryName}.js`,
    path: _resolve(__dirname, 'dist'),
    clean: true,
  },
  target: ['browserslist'],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(s[ac]ss|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '',
            },
          },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff)$/,
        include: join(__dirname, 'src/assets'),
        type: 'asset/resource',
      },
    ],
  },
  stats: {
    colors: true,
  },
  ...(mode !== 'production' && { devtool: 'eval-cheap-module-source-map' }),
};

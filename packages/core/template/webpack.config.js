const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');


<% if (framework === 'react') { %>
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
<% if (language === "typescript") { %>
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
<% } %>
<% } %>

<% if (framework === 'vue') { %>
const { VueLoaderPlugin } = require('vue-loader');
<% } %>
<%_ if (typeof(VueEjs)!= "undefined" && VueEjs.useElementPlus == true) { _%>
const ElementPlus = require('unplugin-element-plus/webpack');
<% } %>

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

<%
const paths = {
  react: {
    typescript: "'./src/index.tsx'",
    javascript: "'./src/index.jsx'",
  },
  vue: {
    typescript: "'./src/main.ts'",
    javascript: "'./src/main.js'",
  }
};
const defaultPath = "'./src/main.js'";
const selectedPath = paths[framework]?.[language] || defaultPath;
%>

module.exports = {
  stats: 'errors-warnings',
  entry: <%- selectedPath %>,
  mode: isDevelopment ? 'development' : 'production',
  output: {
    path: isDevelopment ? undefined : path.resolve(__dirname, './dist'),
    assetModuleFilename: 'assets/[name].[hash:8][ext]',
    filename: isDevelopment
      ? 'js/[name].js'
      : 'js/[name].[contenthash:6].js',
    chunkFilename: isDevelopment
      ? 'js/chunks/[name].js'
      : 'js/chunks/[name].[contenthash:6].js',
    clean: true,
    pathinfo: false,
  },
  module: {
    rules: [
    {
        test: /\.css$/i,
        use: [
          isDevelopment ?
          <% if (framework === 'vue') { %>
          'vue-style-loader'
          <% } else { %>
          'style-loader'
          <% } %>
          : MiniCssExtractPlugin.loader,'css-loader','postcss-loader'].filter(Boolean),
      },
      {
        test: /\.(jpe?g|png|gif|webp|svg|mp4|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset',
        generator: {
          filename: (pathData) => {
            const ext = pathData.filename.split('.').pop();
            if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
              return 'fonts/[name].[hash:8][ext]';
            }
            return 'img/[name].[hash:8][ext]';
          }
        }
      },
      <% if (plugin ==='scss' ) { %>
      {
        test: /\.s[ac]ss$/i,
        use: [
            'style-loader', 
            'css-loader',   
            'sass-loader',  
        ],
      },
      <% } %>
      <% if (framework === 'vue') { %>
      {
        test: /\.vue$/,
        use: [
          {
            loader: "vue-loader",
            options: {
              compilerOptions: {
                preserveWhitespace: false,
              },
              hotReload: isDevelopment,
            },
          },
        ],
      },
      <% } %>
    ].filter(Boolean),
  },
  resolve: {
    extensions: [<% if (framework === 'vue') { %>'.vue', <% } %>'.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@pages': './src/pages',
      '@': './src',
    },
  },
  plugins: [
    // 通用插件
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      title: 'moment',
    }),
    new DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    
    // 生产环境插件
    isProduction && new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:6].css',
    }),
    
    <% if (framework === 'react') { %>
    // React开发环境插件
    isDevelopment && new ReactRefreshWebpackPlugin(),
    <% if (language === "typescript") { %>
    isDevelopment && new ForkTsCheckerWebpackPlugin(),
    <% } %>
    <% } %>
    
    <% if (typeof(VueEjs)!= "undefined" && VueEjs.useElementPlus == true) { %>
    // Element Plus插件
    ElementPlus(),
    <% } %>
    
    <% if (framework === 'vue') { %>
    // Vue插件
    new VueLoaderPlugin()<% } %>
  ].filter(Boolean),
  performance: isProduction
    ? {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      }
    : undefined,
  optimization: isProduction
    ? {
        minimize: true,
        minimizer: [
          new TerserPlugin(),
          new CssMinimizerPlugin(),
        ],
        splitChunks: {
          chunks: 'all',
        },
      }
    : undefined,
};

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Enable React Strict Mode
    images: {
      domains: ['mapbox.com'], // Allow images from Mapbox domain
    },
    webpack(config) {
      config.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'static/fonts/[name].[hash].[ext]',
          },
        },
      });
      return config;
    },
    assetPrefix: '', // Set a custom asset prefix if needed (e.g., for subdirectories)
  };
  
  export default nextConfig;
  
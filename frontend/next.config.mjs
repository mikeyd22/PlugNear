const nextConfig = {
    reactStrictMode: true,
    output: 'standalone', // 👈 Add this line
    images: {
      domains: ['mapbox.com'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'your-image-domain.com',
        },
      ],
    },
    assetPrefix: '', // You can leave this empty unless hosting in a subdirectory
  };